import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoicesResult = await prisma.invoice.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Find lab requests that have costs associated, essentially generating a bill.
        const labRequests = await prisma.labRequest.findMany({
            where: {
                amount: { gt: 0 }
            },
            orderBy: { createdAt: 'desc' }
        });

        // The schema for Invoice has admission and appointment relation but we will just use string columns for uniform display:
        // billNo, date, patientName, grandTotal, paymentMethod, status
        const invoiceBills = invoicesResult.map((inv: any) => {
            let type = "OTHER";
            if (inv.billNo.startsWith("OPD-")) type = "OPD";
            else if (inv.billNo.startsWith("S-")) type = "PHARMACY";
            else if (inv.billNo.startsWith("INV-IPD-")) type = "IPD";

            return {
                id: inv.id,
                billNo: inv.billNo,
                date: inv.createdAt,
                patientName: inv.patientName || "Unknown",
                amount: Number(inv.grandTotal),
                type: type,
                status: inv.status,
                paymentMethod: inv.paymentMethod
            };
        });

        const labBills = labRequests.map((lab: any) => {
            return {
                id: lab.id,
                billNo: `LAB-${lab.id.slice(0, 6).toUpperCase()}`,
                date: lab.createdAt,
                patientName: lab.patientName || "Unknown",
                amount: Number(lab.amount),
                type: "LABORATORY",
                status: lab.status.toUpperCase(), // pending -> PENDING
                paymentMethod: "CASH" // default assumption for labs without dedicated invoice
            };
        });

        // Combine and sort by date descending
        const allBills = [...invoiceBills, ...labBills].sort((a, b) => b.date.getTime() - a.date.getTime());

        return NextResponse.json({ success: true, data: allBills });

    } catch (error: any) {
        console.error("Fetch Bills Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch bills" }, { status: 500 });
    }
}
