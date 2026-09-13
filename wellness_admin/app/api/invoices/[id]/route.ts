import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await props.params;

        // Try fetching as invoice first
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { items: true },
        });

        if (invoice) {
            return NextResponse.json({
                invoice: {
                    ...invoice,
                    subTotal: Number(invoice.subTotal || 0),
                    totalGst: Number((invoice as any).totalGst || 0),
                    discountAmount: Number(invoice.discountAmount || 0),
                    grandTotal: Number(invoice.grandTotal || 0),
                    items: (invoice.items || []).map((i: any) => ({
                        ...i,
                        mrp: Number(i.mrp || 0),
                        amount: Number(i.amount || 0),
                        gstRate: Number(i.gstRate || 0),
                    })),
                    date: invoice.date ? invoice.date.toISOString() : null,
                    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
                }
            });
        }

        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    } catch (error: any) {
        console.error("GET /api/invoices/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await props.params;
        const body = await req.json();
        const { items, discountAmount, paymentMethod, date } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Bill must have at least one item" }, { status: 400 });
        }

        const subTotal = items.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
        const discount = Math.max(0, Number(discountAmount) || 0);
        const grandTotal = Math.max(0, subTotal - discount);

        // Update invoice and its items atomically
        const updatedInvoice = await prisma.$transaction(async (tx) => {
            // Delete existing items and recreate
            await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

            const inv = await tx.invoice.update({
                where: { id },
                data: {
                    subTotal,
                    discountAmount: discount,
                    grandTotal,
                    paymentMethod: paymentMethod || 'CASH',
                    date: date ? new Date(date) : undefined,
                    items: {
                        create: items.map((item: any) => ({
                            medicineId: item.medicineId || 'SERVICE',
                            name: item.name,
                            qty: item.qty || 1,
                            mrp: Number(item.amount) || 0,
                            gstRate: item.gstRate || 0,
                            amount: Number(item.amount) || 0,
                        })),
                    },
                },
                include: { items: true },
            });

            // Update associated Ledger entry if it exists
            const ledgerEntry = await tx.ledger.findFirst({
                where: {
                    OR: [
                        { description: { contains: inv.billNo } },
                        { description: { contains: inv.patientName } },
                    ],
                    transactionType: 'income',
                },
                orderBy: { transactionDate: 'desc' },
            });

            if (ledgerEntry) {
                await tx.ledger.update({
                    where: { id: ledgerEntry.id },
                    data: {
                        amount: grandTotal,
                        paymentMethod: paymentMethod || ledgerEntry.paymentMethod,
                    },
                });
            }

            return inv;
        });

        return NextResponse.json({
            success: true,
            invoice: {
                ...updatedInvoice,
                subTotal: Number(updatedInvoice.subTotal),
                grandTotal: Number(updatedInvoice.grandTotal),
                discountAmount: Number(updatedInvoice.discountAmount),
            }
        });
    } catch (error: any) {
        console.error("PATCH /api/invoices/[id] error:", error);
        return NextResponse.json({ error: error.message || "Failed to update invoice" }, { status: 500 });
    }
}
