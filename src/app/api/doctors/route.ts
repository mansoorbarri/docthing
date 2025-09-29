import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { doctorSchema } from '~/lib/validations/doctor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = doctorSchema.parse(body);

    const newDoctor = await db.doctor.create({
      data: validatedData,
      select: {
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        specialty: true,
      }
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const prismaError = error as { code?: string, meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.join(', ');
        return NextResponse.json(
            { error: `A Doctor with this ${target} already exists.` }, 
            { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Failed to create doctor record." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const doctors = await db.doctor.findMany({
      select: {
        clerkId: true,
        firstName: true,
        lastName: true,
        specialty: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}