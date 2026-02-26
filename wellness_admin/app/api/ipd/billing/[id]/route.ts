
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admissionId = id;
        const body = await req.json();
        const { discountAmount = 0, paymentMethod = "CASH" } = body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get admission and charges
            const admission = await tx.admission.findUnique({
                where: { id: admissionId },
                include: {
                    patient: true,
                    HospitalCharge: true
                }
            });

            if (!admission) throw new Error("Admission not found");

            // 2. Calculate totals
            const subTotal = admission.HospitalCharge.reduce((sum, charge) => sum + Number(charge.amount), 0);
            const totalGst = 0; // Simplified for now
            const grandTotal = Math.max(0, subTotal - Number(discountAmount));

            // 3. Create Invoice
            const billNo = `INV-IPD-${Date.now().toString().slice(-6)}`;
            const invoice = await tx.invoice.create({
                data: {
                    billNo,
                    patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
                    patientPhone: admission.patient.phone,
                    subTotal: subTotal,
                    totalGst: totalGst,
                    discountAmount: Number(discountAmount),
                    grandTotal: grandTotal,
                    paymentMethod,
                    status: "PAID",
                    admissionId: admissionId,
                    items: {
                        create: admission.HospitalCharge.map(charge => ({
                            name: charge.description,
                            qty: 1,
                            mrp: charge.amount,
                            gstRate: 0,
                            amount: charge.amount,
                            medicineId: "SERVICE" // Placeholder for general hospital charges
                        }))
                    }
                }
            });

            // 4. Record in Ledger
            await tx.ledger.create({
                data: {
                    transactionType: 'income',
                    category: 'admin',
                    description: `IPD Billing - Bill for ${admission.patient.firstName} ${admission.patient.lastName} (${billNo})`,
                    amount: grandTotal,
                    paymentMethod: paymentMethod,
                    transactionDate: new Date(),
                    recordedBy: (session.user as any).id
                }
            });

            return invoice;
        });

        return NextResponse.json({ success: true, invoice: result });

    } catch (error: any) {
        console.error("IPD Billing Error:", error);
        return NextResponse.json({ error: error.message || "Billing Failed" }, { status: 500 });
    }
}
