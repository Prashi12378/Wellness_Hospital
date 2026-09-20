import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");
        const status = searchParams.get("status") || "AVAILABLE";

        if (!patientId) {
            return NextResponse.json({ error: "patientId is required" }, { status: 400 });
        }

        const deposits = await (prisma as any).deposit.findMany({
            where: {
                patientId,
                status,
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ success: true, deposits });
    } catch (error: any) {
        console.error("Deposits fetch error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch deposits" }, { status: 500 });
    }
}
