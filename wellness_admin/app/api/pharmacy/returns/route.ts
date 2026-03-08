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

        // 1. Fetch soft-deleted medicines
        const deletedMedicines = await prisma.pharmacyInventory.findMany({
            where: { isDeleted: true },
            orderBy: { updatedAt: 'desc' }
        });

        // 2. Fetch returned invoices
        const returnedInvoices = await prisma.invoice.findMany({
            where: {
                billNo: { startsWith: 'S-' },
                status: 'RETURNED'
            },
            include: {
                items: true,
            },
            orderBy: { updatedAt: 'desc' }
        });

        const serializedInvoices = returnedInvoices.map(invoice => ({
            ...invoice,
            subTotal: Number(invoice.subTotal),
            totalGst: Number(invoice.totalGst),
            grandTotal: Number(invoice.grandTotal),
            discountRate: Number(invoice.discountRate || 0),
            discountAmount: Number(invoice.discountAmount || 0),
            items: (invoice.items || []).map((item: any) => ({
                ...item,
                mrp: Number(item.mrp),
                gstRate: Number(item.gstRate),
                amount: Number(item.amount),
            }))
        }));

        return NextResponse.json({
            deletedMedicines,
            returnedInvoices: serializedInvoices
        });
    } catch (error) {
        console.error("Error fetching returns and deletions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
