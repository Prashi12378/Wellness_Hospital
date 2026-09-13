'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { serializeData } from "@/lib/serialization";

export async function recordDeposit(data: {
    patientId: string;
    amount: number;
    paymentMethod: string;
    description?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const deposit = await (prisma as any).deposit.create({
            data: {
                id: randomUUID(),
                patientId: data.patientId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                description: data.description || "Deposit Payment",
                status: "AVAILABLE",
            }
        });

        // Record to Ledger as income
        await prisma.ledger.create({
            data: {
                transactionType: 'income',
                category: 'deposit',
                description: `Deposit Payment - ${data.description || 'General'}`,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                transactionDate: new Date(),
                recordedBy: (session.user as any).id
            }
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        return { success: true, deposit: serializeData(deposit) };
    } catch (error: any) {
        console.error("Failed to record deposit payment:", error);
        return { success: false, error: error.message || "Failed to record deposit payment" };
    }
}

export async function getPatientDepositBalance(patientId: string) {
    try {
        const deposits = await (prisma as any).deposit.findMany({
            where: {
                patientId,
                status: "AVAILABLE"
            }
        });

        const totalBalance = deposits.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        return { success: true, balance: totalBalance, deposits: serializeData(deposits) };
    } catch (error) {
        console.error("Failed to fetch deposit balance:", error);
        return { success: false, error: "Failed to fetch balance" };
    }
}

export async function updateDeposit(depositId: string, data: {
    amount: number;
    paymentMethod: string;
    description?: string;
    date?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await (prisma as any).deposit.findUnique({
            where: { id: depositId }
        });
        if (!existing) return { success: false, error: "Deposit not found" };

        const updated = await (prisma as any).deposit.update({
            where: { id: depositId },
            data: {
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                description: data.description || existing.description,
                ...(data.date ? { createdAt: new Date(data.date) } : {}),
            }
        });

        // Update the associated Ledger entry for this deposit if it exists
        const ledgerEntry = await prisma.ledger.findFirst({
            where: {
                category: 'deposit',
                transactionType: 'income',
                description: { contains: existing.description || 'Deposit Payment' },
            },
            orderBy: { transactionDate: 'desc' },
        });

        if (ledgerEntry) {
            await prisma.ledger.update({
                where: { id: ledgerEntry.id },
                data: {
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    description: `Deposit Payment - ${data.description || existing.description || 'General'}`,
                    ...(data.date ? { transactionDate: new Date(data.date) } : {}),
                }
            });
        }

        revalidatePath(`/dashboard/patients/${existing.patientId}`);
        revalidatePath(`/dashboard/ipd`);
        return { success: true, deposit: serializeData(updated) };
    } catch (error: any) {
        console.error("Failed to update deposit:", error);
        return { success: false, error: error.message || "Failed to update deposit" };
    }
}
