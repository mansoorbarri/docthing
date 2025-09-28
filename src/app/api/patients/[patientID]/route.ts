import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updatePatientSchema } from '~/lib/validations/patient';

interface Params {
  params: {
    patientID: string;
  };
}


export async function GET(request: Request, { params }: Params) {
  const { patientID } = params;

  try {
    const patient = await db.patient.findUnique({
      where: {
        id: patientID,
      },
      include: {
        appointments: {
          orderBy: { startTime: "desc" },
        },
        patientReports: {
          orderBy: { reportDate: "desc" },
        },
        prescriptions: {
          orderBy: { datePrescribed: "desc" },
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: `Patient with ID ${patientID} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { patientID } = params;

  try {
    const body = await request.json();
    
    const validatedData = updatePatientSchema.parse(body);
    
    const { dateOfBirth, ...dataToUpdate } = validatedData;

    if (dateOfBirth) {
        (dataToUpdate as any).dateOfBirth = new Date(dateOfBirth);
    }
    
    const updatedPatient = await db.patient.update({
      where: {
        id: patientID,
      },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedPatient, { status: 200 });
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
            { error: `Patient with ID ${patientID} not found.` }, 
            { status: 404 }
        );
    }

    if (prismaError.code === 'P2002') {
        return NextResponse.json(
            { error: "Unique field already exists." }, 
            { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Failed to update patient record." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { patientID } = params;

  try {    
    await db.patient.delete({
      where: {
        id: patientID,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Patient with ID ${patientID} not found.` }, 
            { status: 404 }
        );
    }
    
    return NextResponse.json(
      { error: "Failed to delete patient record." },
      { status: 500 }
    );
  }
}