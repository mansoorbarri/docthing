import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updateInventorySchema } from '~/lib/validations/inventory';
import { auth } from '@clerk/nextjs/server';

interface Params {
    params: { inventoryItemID: string };
}

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

// GET: Retrieve a single Inventory Item by ID
export async function GET(request: Request, { params }: Params) {
    const { inventoryItemID } = params;

    try {
        const item = await db.inventoryItem.findUnique({
            where: { id: inventoryItemID },
        });

        if (!item) {
            return NextResponse.json(
                { error: `Inventory item with ID ${inventoryItemID} not found.` },
                { status: 404 }
            );
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        return NextResponse.json({ error: "Failed to fetch inventory item." }, { status: 500 });
    }
}

// PATCH: Update an Inventory Item
export async function PATCH(request: Request, { params }: Params) {
    // const authError = await checkPharmacist();
    // if (authError) return authError;

    const { inventoryItemID } = params;

    try {
        const body = await request.json();
        const validatedData = updateInventorySchema.parse(body);

        const updatedItem = await db.inventoryItem.update({
            where: { id: inventoryItemID },
            data: validatedData,
        });

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid update data.", details: error.flatten().fieldErrors }, { status: 400 });
        }

        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2025') {
            return NextResponse.json({ error: `Inventory item with ID ${inventoryItemID} not found.` }, { status: 404 });
        }

        console.error('Error updating inventory item:', error);
        return NextResponse.json({ error: "Failed to update inventory item." }, { status: 500 });
    }
}

// DELETE: Delete an Inventory Item
export async function DELETE(request: Request, { params }: Params) {
    // const authError = await checkPharmacist();
    // if (authError) return authError;

    const { inventoryItemID } = params;

    try {
        await db.inventoryItem.delete({
            where: { id: inventoryItemID },
        });

        // 204 No Content is the standard response for a successful DELETE
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const prismaError = error as { code?: string };

        if (prismaError.code === 'P2025') {
            return NextResponse.json(
                { error: `Inventory item with ID ${inventoryItemID} not found for deletion.` },
                { status: 404 }
            );
        }

        // P2003 handles foreign key constraint, preventing deletion if stock has been dispensed
        if (prismaError.code === 'P2003') {
             return NextResponse.json(
                { error: "Cannot delete item. Inventory is linked to existing dispensation records." },
                { status: 409 } // 409 Conflict
            );
        }

        console.error('Error deleting inventory item:', error);
        return NextResponse.json({ error: "Failed to delete inventory item." }, { status: 500 });
    }
}