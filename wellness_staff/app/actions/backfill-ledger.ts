'use server';

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function backfillLedger() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        let backfilledIPD = 0;
        let backfilledOPD = 0;

        // 1. Backfill IPD Discharged Patients
        const dischargedAdmissions = await prisma.admission.findMany({
            where: { status: 'discharged' },
            include: {
                patient: true,
                HospitalCharge: true
            }
        });

        for (const admission of dischargedAdmissions) {
            const shortId = admission.id.slice(-6).toUpperCase();
            const pattern = `IP-${shortId}`;

            // Check if ledger already exists for this IPD discharge
            const existing = await prisma.ledger.findFirst({
                where: {
                    description: { contains: pattern },
                    category: 'staff'
                }
            });

            if (!existing) {
                const totalAmount = admission.HospitalCharge.reduce((sum, charge) => sum + Number(charge.amount), 0);
                if (totalAmount > 0) {
                    await prisma.ledger.create({
                        data: {
                            transactionType: 'income',
                            category: 'staff',
                            description: `IPD Discharge (Backfill) - Bill for ${admission.patient.firstName} ${admission.patient.lastName} (${pattern})`,
                            amount: totalAmount,
                            paymentMethod: 'CASH', // Default for historical
                            transactionDate: admission.dischargeDate || admission.updatedAt,
                            recordedBy: (session.user as any).id
                        }
                    });
                    backfilledIPD++;
                }
            }
        }

        // 2. Backfill OPD Invoices
        const opdInvoices = await prisma.invoice.findMany({
            where: {
                billNo: { startsWith: 'OPD-' }
            }
        });

        for (const invoice of opdInvoices) {
            const pattern = `OPD Bill #${invoice.billNo}`;

            const existing = await prisma.ledger.findFirst({
                where: {
                    description: { contains: invoice.billNo },
                    category: 'staff'
                }
            });

            if (!existing) {
                await prisma.ledger.create({
                    data: {
                        transactionType: 'income',
                        category: 'staff',
                        description: `OPD Bill (Backfill) #${invoice.billNo} (${invoice.patientName})`,
                        amount: invoice.grandTotal,
                        paymentMethod: invoice.paymentMethod,
                        transactionDate: invoice.date,
                        recordedBy: (session.user as any).id
                    }
                });
                backfilledOPD++;
            }
        }

        return {
            success: true,
            message: `Backfill complete. Records added: IPD: ${backfilledIPD}, OPD: ${backfilledOPD}`
        };
    } catch (error) {
        console.error("Backfill failed:", error);
        return { success: false, error: "Backfill failed" };
    }
}
