import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
// Assuming a Zod schema for dispensation creation
import { dispensationSchema } from '~/lib/validations/dispensation';
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


// GET: Retrieve all Dispensation Records
export async function GET() {
  const authError = checkPharmacist();
  if (authError) return authError;
  
  try {
    const dispensations = await db.dispensation.findMany({
      orderBy: { dateDispensed: 'desc' },
      include: {
        prescription: {
          select: { medicationName: true, patientId: true },
        },
        inventoryItem: {
          select: { name: true, unit: true },
        },
      },
    });

    return NextResponse.json(dispensations, { status: 200 });
  } catch (error) {
    console.error('Error fetching dispensations:', error);
    return NextResponse.json({ error: "Failed to fetch dispensation records." }, { status: 500 });
  }
}

// POST: Fulfill a Prescription (Critical Logic)
export async function POST(request: Request) {
  const authError = checkPharmacist();
  if (authError) return authError;

  // We use the authenticated user's ID for the 'dispensedBy' field
  const { userId } = await auth(); 

  try {
    const body = await request.json();
    const validatedData = dispensationSchema.parse(body);
    const { prescriptionId, inventoryItemId, quantity } = validatedData;
    
    // --- TRANSACTION START ---
    // Ensure both creation and stock update succeed or fail together
    const newDispensation = await db.$transaction(async (tx) => {
      
      // 1. Check current stock and ensure enough is available
      const item = await tx.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        select: { currentStock: true, name: true }
      });

      if (!item) {
        throw new Error(`Inventory item not found: ${inventoryItemId}`);
      }
      if (item.currentStock < quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${item.currentStock}, Requested: ${quantity}`);
      }
      
      // 2. Decrement the stock quantity
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { currentStock: { decrement: quantity } },
      });

      // 3. Create the Dispensation record
      return await tx.dispensation.create({
        data: {
          prescriptionId,
          inventoryItemId,
          quantity,
          dispensedBy: userId!, // userId is guaranteed to be present by checkPharmacist()
        },
        include: {
          prescription: { select: { medicationName: true } },
          inventoryItem: { select: { name: true } },
        }
      });
    });
    // --- TRANSACTION END ---

    return NextResponse.json(newDispensation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data.", details: error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Custom error handling for stock/item issues
    if (error instanceof Error && (error.message.includes('Insufficient stock') || error.message.includes('Inventory item not found'))) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // P2003 handles foreign key errors (e.g., bad prescriptionId)
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: "Invalid Prescription ID or Inventory Item ID." }, { status: 400 });
    }

    console.error('Error creating dispensation:', error);
    return NextResponse.json({ error: "Failed to fulfill prescription." }, { status: 500 });
  }
}