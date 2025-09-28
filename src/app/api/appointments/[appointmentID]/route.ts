import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updateAppointmentSchema } from '~/lib/validations/appointment';

interface Params {
  params: {
    appointmentID: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const { appointmentID } = params;

  try {
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentID,
      },
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        report: true,
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: `Appointment with ID ${appointmentID} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { appointmentID } = params;

  try {
    const body = await request.json();
    
    const validatedData = updateAppointmentSchema.parse(body);
    
    const { startTime, endTime, reportId, ...dataToUpdate } = validatedData;
    
    const data: any = { ...dataToUpdate };

    if (startTime) {
        data.startTime = new Date(startTime);
    }
    if (endTime) {
        data.endTime = new Date(endTime);
    }

    if (reportId !== undefined) {
      data.reportId = reportId || null;
    }
    
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointmentID,
      },
      data: data,
    });

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Appointment with ID ${appointmentID} not found.` }, 
            { status: 404 }
        );
    }
    
    if (prismaError.code === 'P2003') {
        return NextResponse.json(
            { error: "Invalid foreign key provided (Doctor ID, Patient ID, or Report ID)." }, 
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
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { appointmentID } = params;

  try {
    await db.appointment.delete({
      where: {
        id: appointmentID,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Appointment with ID ${appointmentID} not found.` }, 
            { status: 404 }
        );
    }
    
    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 }
    );
  }
}