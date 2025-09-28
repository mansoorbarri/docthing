import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updateDoctorSchema } from '~/lib/validations/doctor';

interface Params {
  params: {
    doctorID: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const { doctorID } = params;

  try {
    const doctor = await db.doctor.findUnique({
      where: {
        id: doctorID,
      },
      include: {
        patientReports: {
          select: { id: true, diagnosis: true, reportDate: true, patient: { select: { firstName: true, lastName: true } } },
          orderBy: { reportDate: "desc" },
        },
        appointments: {
          select: { id: true, startTime: true, patient: { select: { firstName: true, lastName: true } } },
          orderBy: { startTime: "desc" },
        },
      }
    });

    if (!doctor) {
      return NextResponse.json(
        { error: `Doctor with ID ${doctorID} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { doctorID } = params;

  try {
    const body = await request.json();
    
    const validatedData = updateDoctorSchema.parse(body);
    
    const updatedDoctor = await db.doctor.update({
      where: {
        id: doctorID,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedDoctor, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const prismaError = error as { code?: string, meta?: { target?: string[] } };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Doctor with ID ${doctorID} not found.` }, 
            { status: 404 }
        );
    }
    
    if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.join(', ');
        return NextResponse.json(
            { error: `A Doctor with this ${target} already exists.` }, 
            { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Failed to update doctor record." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { doctorID } = params;

  try {
    await db.doctor.delete({
      where: {
        id: doctorID,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Doctor with ID ${doctorID} not found.` }, 
            { status: 404 }
        );
    }
    
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { error: `Cannot delete Doctor ID ${doctorID}. Related reports or appointments exist.` }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete doctor record." },
      { status: 500 }
    );
  }
}