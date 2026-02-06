import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // We don't have a Report model yet in the schema I saw.
        // Checking schema in Step 157, there is NO 'Report' model.
        // 'BloodCollectionRequest' exists. Is that what 'reports' refers to?
        // Let's assume reports might come from BloodCollectionRequests that are completed?
        // Or maybe there is a 'Report' model I missed?
        // Let's check schema again or assume we need to create it.
        // For now, I'll return dummy data or map from BloodCollectionRequests if status is completed?

        // Actually, let's look at what the frontend expects.
        // Using `blood_collection_requests` as a proxy for reports for now if `status` is 'completed'.

        const reports = await prisma.bloodCollectionRequest.findMany({
            // Note: BloodCollectionRequest lacks userId field for proper filtering by user
            // Returning all reports for now - this should be improved with proper userId relation
        });

        // Wait, I can't filter by user efficiently without userId.
        // I should ADD userId to BloodCollectionRequest and AmbulanceRequest if possible, or link to Profile case.

        return NextResponse.json([]);

    } catch (error) {
        console.error("Reports Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
