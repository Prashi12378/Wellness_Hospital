
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
        const { discountAmount = 0, paymentMethod = "CASH", date } = body;

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

            // 2. Fetch available patient deposits
            const deposits = await (tx as any).deposit.findMany({
                where: {
                    patientId: admission.patientId,
                    status: "AVAILABLE"
                }
            });

            const totalAdvance = deposits.reduce((sum: number, d: any) => sum + Number(d.amount), 0);

            // 3. Calculate totals
            const subTotal = admission.HospitalCharge.reduce((sum, charge) => sum + Number(charge.amount), 0);
            const afterDiscount = Math.max(0, subTotal - Number(discountAmount));
            const appliedDeposit = Math.min(afterDiscount, totalAdvance);
            const grandTotal = Math.max(0, afterDiscount - appliedDeposit);

            // 4. Create Invoice
            const billNo = `INV-IPD-${Date.now().toString().slice(-6)}`;
            const invoice = await tx.invoice.create({
                data: {
                    billNo,
                    patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
                    patientPhone: admission.patient.phone,
                    subTotal: subTotal,
                    totalGst: 0,
                    discountAmount: Number(discountAmount),
                    depositAmount: appliedDeposit,
                    grandTotal: grandTotal,
                    paymentMethod,
                    status: "PAID",
                    admissionId: admissionId,
                    date: date ? new Date(date) : new Date(),
                    items: {
                        create: admission.HospitalCharge.map(charge => ({
                            name: charge.description,
                            qty: 1,
                            mrp: charge.amount,
                            gstRate: 0,
                            amount: charge.amount,
                            medicineId: "SERVICE"
                        }))
                    }
                }
            });

            // 5. Mark applied deposits as CONSUMED
            if (appliedDeposit > 0) {
                let remaining = appliedDeposit;
                for (const dep of deposits) {
                    if (remaining <= 0) break;
                    remaining -= Math.min(Number(dep.amount), remaining);
                    await (tx as any).deposit.update({
                        where: { id: dep.id },
                        data: { status: "CONSUMED", updatedAt: new Date() }
                    });
                }
            }

            // 6. Record in Ledger
            await tx.ledger.create({
                data: {
                    transactionType: 'income',
                    category: 'admin',
                    description: `IPD Billing - Bill for ${admission.patient.firstName} ${admission.patient.lastName} (${billNo})${appliedDeposit > 0 ? ` [Advance Applied: ₹${appliedDeposit}]` : ''}`,
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
