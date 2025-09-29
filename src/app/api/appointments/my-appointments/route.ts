import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointments = await db.appointment.findMany({
      where: {
        doctorId: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            CNIC: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}