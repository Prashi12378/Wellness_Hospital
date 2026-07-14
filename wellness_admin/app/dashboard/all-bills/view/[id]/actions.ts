'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateBillDate(id: string, newDateStr: string, isInvoice: boolean, type: string) {
    try {
        const newDate = new Date(newDateStr);
        if (isNaN(newDate.getTime())) {
            return { success: false, error: 'Invalid date/time value' };
        }

        if (type === 'LABORATORY' && !isInvoice) {
            await prisma.labRequest.update({
                where: { id },
                data: { createdAt: newDate }
            });
        } else {
            await prisma.invoice.update({
                where: { id },
                data: { createdAt: newDate }
            });
        }

        revalidatePath(`/dashboard/all-bills/view/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update bill date:", error);
        return { success: false, error: error.message || "Failed to update date" };
    }
}
