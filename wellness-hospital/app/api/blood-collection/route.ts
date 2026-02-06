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
        const {
            patient_name,
            phone,
            address,
            collection_date,
            collection_time,
            selected_tests,
            total_price
        } = body;

        if (!patient_name || !phone || !address || !collection_date || !selected_tests) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const request = await prisma.bloodCollectionRequest.create({
            data: {
                patientName: patient_name,
                phone,
                address,
                collectionDate: collection_date,
                collectionTime: collection_time,
                selectedTests: selected_tests, // Prisma handles Json type
                totalPrice: total_price,
                status: 'pending'
            }
        });

        return NextResponse.json({ success: true, id: request.id });

    } catch (error) {
        console.error("Blood Collection Request Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
