
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

        const doctors = await prisma.profile.findMany({
            where: {
                role: 'doctor'
            },
            include: {
                user: true // Include user details if needed
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data to match frontend expectation if needed, or update frontend to match schema
        // The frontend expects: full_name, role, phone, etc.
        // Our schema uses camelCase usually, but let's check what prisma returns.
        // Prisma returns fields as defined in schema.
        // If schema has @map("first_name"), it returns firstName in JS object? NO, it returns the model field name.
        // Let's assume standard mapping. The frontend uses `full_name` which might be from Supabase.
        // We might need to map it or update frontend.
        // Let's Return as is and fix frontend mapping.

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
