import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import {
  ReportParamsSchema,
  ClientReportPayloadSchema,
  type ClientReportPayload,
} from "~/lib/validations/report";
import { ZodError } from "zod";

function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        message: "Invalid request data", 
        errors: error.flatten().fieldErrors 
      },
      { status: 400 }
    );
  }
  console.error("Internal server error:", error);
  return NextResponse.json(
    { message: "Internal Server Error" },
    { status: 500 }
  );
}

const toNullable = (value: string | undefined | null | '') => 
    (value === '' || value === undefined) ? null : value;

export async function GET(
  req: NextRequest,
  { params }: { params: { patientID: string } }
) {
  try {
    const paramsValidation = ReportParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return handleRouteError(paramsValidation.error);
    }
    const { patientID: patientId } = paramsValidation.data;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reports = await db.patientReport.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        reportDate: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { patientID: string } }
) {
  try {
    const paramsValidation = ReportParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return handleRouteError(paramsValidation.error);
    }
    const patientId = paramsValidation.data.patientID;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await db.doctor.findUnique({
      where: { clerkId: userId },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }
    const doctorId = doctor.clerkId; 

    const body = await req.json();

    const bodyValidation = ClientReportPayloadSchema.safeParse(body);
    if (!bodyValidation.success) {
      return handleRouteError(bodyValidation.error);
    }
    
    const validatedData = bodyValidation.data as ClientReportPayload;

    const newReport = await db.patientReport.create({
      data: {
        patientId: patientId,
        doctorId: doctorId,
        chiefComplaint: toNullable(validatedData.chiefComplaint),
        diagnosis: validatedData.diagnosis,
        treatmentPlan: toNullable(validatedData.treatmentPlan),
        notes: toNullable(validatedData.notes),
        appointmentId: toNullable(validatedData.appointmentId),
        reportDate: validatedData.reportDate ? new Date(validatedData.reportDate) : undefined, 
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}