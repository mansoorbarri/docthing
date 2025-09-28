import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { updatePatientReportSchema } from '~/lib/validations/report';

interface Params {
  params: {
    reportId: string;
  };
}

// GET /api/reports/[reportId] -> Fetch a single report
export async function GET(request: Request, { params }: Params) {
  const { reportId } = params;

  try {
    const report = await db.patientReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        patient: true,
        appointment: true,
        prescriptions: true,
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: `Report with ID ${reportId} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[reportId] -> Update a report
export async function PATCH(request: Request, { params }: Params) {
  const { reportId } = params;

  try {
    const body = await request.json();
    
    const validatedData = updatePatientReportSchema.parse(body);
    
    // Prepare data for update: handle optional date and nullify empty strings
    const { reportDate, appointmentId, ...dataToUpdate } = validatedData;

    if (reportDate) {
        (dataToUpdate as any).reportDate = new Date(reportDate);
    }
    
    const data: any = { ...dataToUpdate };
    
    // Explicitly set relationship fields to null if empty string is passed
    if (appointmentId !== undefined) {
      data.appointmentId = appointmentId || null;
    }

    const updatedReport = await db.patientReport.update({
      where: {
        id: reportId,
      },
      data: data,
    });

    return NextResponse.json(updatedReport, { status: 200 });
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
            { error: `Report with ID ${reportId} not found.` }, 
            { status: 404 }
        );
    }
    
    if (prismaError.code === 'P2003') {
        return NextResponse.json(
            { error: "Invalid foreign key update (Doctor, Patient, or Appointment ID)." }, 
            { status: 400 }
        );
    }

    return NextResponse.json(
      { error: "Failed to update report." },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[reportId] -> Delete a report
export async function DELETE(request: Request, { params }: Params) {
  const { reportId } = params;

  try {
    await db.patientReport.delete({
      where: {
        id: reportId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2025') {
        return NextResponse.json(
            { error: `Report with ID ${reportId} not found.` }, 
            { status: 404 }
        );
    }
    
    return NextResponse.json(
      { error: "Failed to delete report." },
      { status: 500 }
    );
  }
}