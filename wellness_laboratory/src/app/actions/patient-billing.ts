'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeData } from "@/lib/serialization";

export async function recordAdvancePayment(data: {
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

        const advance = await (prisma as any).advancePayment.create({
            data: {
                id: randomUUID(),
                patientId: data.patientId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                description: data.description || "Advance Payment",
                status: "AVAILABLE",
            }
        });

        // Record to Ledger as income
        await prisma.ledger.create({
            data: {
                transactionType: 'income',
                category: 'advance',
                description: `Advance Payment - ${data.description || 'General'}`,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                transactionDate: new Date(),
                recordedBy: (session.user as any).id
            }
        });

        revalidatePath(`/dashboard/patients/${data.patientId}`);
        return { success: true, advance: serializeData(advance) };
    } catch (error: any) {
        console.error("Failed to record advance payment:", error);
        return { success: false, error: error.message || "Failed to record advance payment" };
    }
}

export async function getPatientAdvanceBalance(patientId: string) {
    try {
        const advances = await (prisma as any).advancePayment.findMany({
            where: {
                patientId,
                status: "AVAILABLE"
            }
        });

        const totalBalance = advances.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        return { success: true, balance: totalBalance, advances: serializeData(advances) };
    } catch (error) {
        console.error("Failed to fetch advance balance:", error);
        return { success: false, error: "Failed to fetch balance" };
    }
}
