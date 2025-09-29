// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '~/server/db';

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
  
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    const email = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id)?.email_address ?? email_addresses[0]?.email_address;

    if (!email) {
        return new Response('User created event missing primary email', { status: 400 });
    }

    try {
      await db.doctor.create({
        data: {
          clerkId: id,
          email: email,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          specialty: 'Unassigned',
          isAdmin: false,
        },
      });

      return new Response('User Synced to DB', { status: 200 });

    } catch (dbError) {
      return new Response('Database Error', { status: 500 });
    }
  }

  return new Response('Event handled successfully or ignored', { status: 200 });
}