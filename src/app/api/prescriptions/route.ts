import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { prescriptionSchema } from '~/lib/validations/prescription';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = prescriptionSchema.parse(body);
    const { reportId, ...rest } = validatedData;
    
    const newPrescription = await db.prescription.create({
      data: {
        ...rest,
        reportId: reportId || null,
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        report: { select: { id: true, diagnosis: true } },
      }
    });

    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const prismaError = error as { code?: string };
    
    if (prismaError.code === 'P2003') {
        return NextResponse.json(
            { error: "Invalid Patient ID or Report ID." }, 
            { status: 400 }
        );
    }

    return NextResponse.json(
      { error: "Failed to create prescription." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const prescriptions = await db.prescription.findMany({
      orderBy: {
        datePrescribed: "desc",
      },
      select: {
        id: true,
        medicationName: true,
        dosage: true,
        datePrescribed: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        reportId: true,
      },
    });

    return NextResponse.json(prescriptions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}