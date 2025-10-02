import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
// Assuming you have a Zod schema defined for validation
import { inventorySchema } from '~/lib/validations/inventory';
import { auth } from '@clerk/nextjs/server';

interface PublicMetadata {
    role?: string;
}

const checkPharmacist = async () => {
  const { userId, sessionClaims } = await auth(); 
  
  if (!userId || (sessionClaims?.publicMetadata as PublicMetadata)?.role !== 'pharmacist') {
    return new NextResponse('Forbidden: Pharmacist access required.', { status: 403 });
  }
  return null;
};

// GET: Retrieve all Inventory Items
export async function GET() {
  try {
    
    const inventory = await db.inventoryItem.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: "Failed to fetch inventory." }, { status: 500 });
  }
}

// POST: Create a new Inventory Item
export async function POST(request: Request) {
//   const authError = checkPharmacist();
//   if (authError) return authError;
  
  try {
    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const newItem = await db.inventoryItem.create({
      data: validatedData,
    });
    console.log(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid inventory data.", details: error.flatten().fieldErrors }, { status: 400 });
    }
    
    const prismaError = error as { code?: string, meta?: { target?: string } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target === 'name') {
        return NextResponse.json({ error: "An inventory item with this name already exists." }, { status: 400 });
    }

    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: "Failed to create inventory item." }, { status: 500 });
  }
}