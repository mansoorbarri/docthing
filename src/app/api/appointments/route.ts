import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { appointmentSchema } from '~/lib/validations/appointment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = appointmentSchema.parse(body);
    const { startTime, endTime, reportId, ...rest } = validatedData;
    
    const newAppointment = await db.appointment.create({
      data: {
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reportId: reportId || null,
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
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
            { error: "Invalid Doctor ID, Patient ID, or Report ID." }, 
            { status: 400 }
        );
    }
    
    if (prismaError.code === 'P2002') {
        return NextResponse.json(
            { error: "Report ID is already linked to another appointment." }, 
            { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const appointments = await db.appointment.findMany({
      orderBy: {
        startTime: "asc",
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        doctor: { select: { firstName: true, lastName: true } },
        patient: { select: { firstName: true, lastName: true, medicalRecordId: true } },
      },
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}