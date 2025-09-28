import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { patientSchema } from '~/lib/validations/patient';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ZOD VALIDATION
    const validatedData = patientSchema.parse(body);

    const newPatient = await db.patient.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        // Ensure conversion happens after successful Zod validation
        dateOfBirth: new Date(validatedData.dateOfBirth), 
        gender: validatedData.gender,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        medicalRecordId: validatedData.medicalRecordId,
      },
    });

    return NextResponse.json(newPatient, { status: 201 });
} catch (error) {
    if (error instanceof z.ZodError) {
        // Return 400 Bad Request with Zod validation details
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    // FIX: Type assertion to check for Prisma error properties
    const prismaError = error as { code?: string }; 

    if (prismaError.code === 'P2002') {
        return NextResponse.json(
            { error: "Medical Record ID or unique field already exists." }, 
            { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Failed to create patient record." },
      { status: 500 }
    );
  }
}


// GET route remains unchanged
export async function GET() {
  try {
    const patients = await db.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        medicalRecordId: true,
        createdAt: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}