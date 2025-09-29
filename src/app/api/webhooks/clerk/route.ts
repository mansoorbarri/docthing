// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '~/server/db';
import type { User } from '@clerk/nextjs/server';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: any;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    return new Response('Webhook Error (Verification Failed)', { status: 403 });
  }

  const eventType = evt.type;
  const data = evt.data as User;
  
  try {
    switch (eventType) {
      case 'user.created': {
        
        await db.doctor.create({
          data: {
            clerkId: data.id,
            firstName: data.firstName ?? null,
            lastName: data.lastName ?? null,
            specialty: 'Unassigned',
          },
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            specialty: true,
          }
        });
        break;
      }
      console.log(data);

      case 'user.updated': {
        
        await db.doctor.upsert({
            where: { clerkId: data.id },
            update: {
                firstName: data.firstName ?? null,
                lastName: data.lastName ?? null,
            },
            create: { 
                clerkId: data.id,
                firstName: data.firstName ?? null,
                lastName: data.lastName ?? null,
                specialty: 'Unassigned',
            },
        });
        break;
      }

      case 'user.deleted': {
        
        await db.doctor.delete({
          where: { clerkId: data.id },
        });
        break;
      }

      default:
        return new Response('Event type not handled', { status: 200 });
    }

    return new Response('User Synced to DB', { status: 200 });
    
  } catch (dbError) {
    return new Response('Database Error: Could not process event', { status: 500 });
  }
}