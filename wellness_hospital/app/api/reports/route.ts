import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // TODO: Implement proper Report model or link BloodCollectionRequest to userId
        // For now, returning empty array to prevent portal from hanging
        console.log("Reports API called for user:", session.user.id);
        return NextResponse.json([]);

    } catch (error) {
        console.error("Reports Fetch Error:", error);
        // Return empty array instead of 500 to allow portal to load
        return NextResponse.json([]);
    }
}
