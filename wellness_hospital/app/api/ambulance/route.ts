import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { patient_name, phone, location, service_type } = body;

        if (!patient_name || !phone || !location || !service_type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const request = await prisma.ambulanceRequest.create({
            data: {
                patientName: patient_name,
                phone,
                location,
                serviceType: service_type,
                status: 'pending'
            }
        });

        return NextResponse.json({ success: true, id: request.id });

    } catch (error) {
        console.error("Ambulance Request Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
