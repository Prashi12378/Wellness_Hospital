'use server';

import { prisma as db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getInventory() {
    try {
        const medicines = await db.pharmacyInventory.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        return { data: medicines };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return { error: 'Failed to fetch inventory' };
    }
}

export async function addMedicine(formData: any) {
    try {
        await db.pharmacyInventory.create({
            data: {
                name: formData.name,
                batch_no: formData.batch_no,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date) : null,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                location: formData.location,
            },
        });
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error adding medicine:', error);
        return { error: 'Failed to add medicine' };
    }
}

export async function deleteMedicine(id: string) {
    try {
        await db.pharmacyInventory.delete({
            where: { id },
        });
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return { error: 'Failed to delete medicine' };
    }
}
