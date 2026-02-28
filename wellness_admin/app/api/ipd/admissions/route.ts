
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

        const admissions = await prisma.admission.findMany({
            include: {
                patient: true,
                primaryDoctor: true,
                HospitalCharge: true,
                pharmacyInvoices: true,
            },
            orderBy: {
                admissionDate: 'desc'
            }
        });

        // Add calculated totals for the frontend
        const mappedAdmissions = admissions.map(admission => {
            const totalCharges = admission.HospitalCharge.reduce((sum, charge) => sum + Number(charge.amount), 0);
            return {
                ...admission,
                totalCharges
            };
        });

        return NextResponse.json(mappedAdmissions);
    } catch (error) {
        console.error("Error fetching IPD admissions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
