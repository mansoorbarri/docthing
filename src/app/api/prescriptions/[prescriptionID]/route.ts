import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updatePrescriptionSchema } from '~/lib/validations/prescription';

interface Params {
  params: {
    prescriptionID: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const { prescriptionID } = params;

  try {
    const prescription = await db.prescription.findUnique({
      where: {
        id: prescriptionID,
      },
      include: {
        patient: true,
        report: {
          select: { id: true, reportDate: true, diagnosis: true, doctor: { select: { lastName: true } } }
        },
      }
    });

    if (!prescription) {
      return NextResponse.json(
        { error: `Prescription with ID ${prescriptionID} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(prescription, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { prescriptionID } = params;

  try {
    const body = await request.json();
    
    const validatedData = updatePrescriptionSchema.parse(body);
    
    const { reportId, ...dataToUpdate } = validatedData;
    
    const data: any = { ...dataToUpdate };

    if (reportId !== undefined) {
      data.reportId = reportId || null;
    }

    const updatedPrescription = await db.prescription.update({
      where: {
        id: prescriptionID,
      },
      data: data,
    });

    return NextResponse.json(updatedPrescription, { status: 200 });
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
            { error: `Prescription with ID ${prescriptionID} not found.` }, 
            { status: 404 }
        );
    }
    
    if (prismaError.code === 'P2003') {
        return NextResponse.json(
            { error: "Invalid Report ID provided." }, 
            { status: 400 }
        );
    }

    return NextResponse.json(
      { error: "Failed to update prescription." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { prescriptionID } = params;

  try {
    await db.prescription.delete({
      where: {
        id: prescriptionID,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Prescription with ID ${prescriptionID} not found.` }, 
            { status: 404 }
        );
    }
    
    return NextResponse.json(
      { error: "Failed to delete prescription." },
      { status: 500 }
    );
  }
}