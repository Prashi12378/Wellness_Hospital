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

        const prescriptions = await prisma.prescription.findMany({
            where: {
                patient: {
                    userId: session.user.id
                }
            },
            include: {
                doctor: true,
                appointment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formatted = prescriptions.map(p => ({
            id: p.id,
            doctor_name: p.doctorName,
            date: p.createdAt.toISOString().split('T')[0],
            medicines: p.medicines, // Assuming JSON
            notes: p.additionalNotes
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("Prescriptions Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
