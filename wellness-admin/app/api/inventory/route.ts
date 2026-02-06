
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

        const inventory = await prisma.pharmacyInventory.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(inventory);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
