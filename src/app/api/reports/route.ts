import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { z } from 'zod';
import { patientReportSchema } from '~/lib/validations/report';

// POST /api/reports -> Create a new Patient Report
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validatedData = patientReportSchema.parse(body);

    const newReport = await db.patientReport.create({
      data: {
        ...validatedData,
        // Convert date string if provided, otherwise Prisma uses default(now())
        reportDate: validatedData.reportDate ? new Date(validatedData.reportDate) : undefined, 
        // Ensure empty string appointmentId becomes null for optional relation
        appointmentId: validatedData.appointmentId || null, 
      },
      // Return key relations for context
      include: {
        doctor: { select: { firstName: true, lastName: true } },
        patient: { select: { firstName: true, lastName: true } },
      }
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Invalid request data.", details: error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const prismaError = error as { code?: string };
    
    // P2003: Foreign key constraint failed (doctorId or patientID doesn't exist)
    if (prismaError.code === 'P2003') {
        return NextResponse.json(
            { error: "Invalid Doctor ID or Patient ID." }, 
            { status: 400 }
        );
    }

    return NextResponse.json(
      { error: "Failed to create patient report." },
      { status: 500 }
    );
  }
}

// GET /api/reports -> Fetch a list of all Patient Reports (latest first)
export async function GET() {
  try {
    const reports = await db.patientReport.findMany({
      orderBy: {
        reportDate: "desc",
      },
      select: {
        id: true,
        reportDate: true,
        diagnosis: true,
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordId: true } },
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        appointmentId: true,
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}