'use server';

import { prisma as db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function getInventory() {
    try {
        const medicines = await db.pharmacyInventory.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        // Convert Decimal to number for serialization
        const serializedMedicines = medicines.map(m => ({
            ...m,
            price: Number(m.price),
            gst_rate: Number(m.gst_rate)
        }));

        return { data: serializedMedicines };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return { error: 'Failed to fetch inventory' };
    }
}

export async function addMedicine(formData: any) {
    try {
        const stock = parseInt(formData.stock);
        const medicine = await db.pharmacyInventory.create({
            data: {
                name: formData.name,
                batch_no: formData.batch_no,
                hsn_code: formData.hsn_code,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date) : null,
                price: parseFloat(formData.price),
                gst_rate: parseFloat(formData.gst_rate || 5),
                stock: stock,
                location: formData.location,
            },
        });

        // Trigger alert if stock is low
        if (stock < 10) {
            await createNotification(
                'Low Stock Alert',
                `Medicine "${formData.name}" is low on stock (${stock} units).`,
                'low_stock'
            );
        }

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

export async function updateStock(id: string, qty: number) {
    try {
        const medicine = await db.pharmacyInventory.update({
            where: { id },
            data: {
                stock: { increment: qty }
            }
        });

        // Trigger alert if stock is low
        if (medicine.stock < (medicine.autoReorderPoint || 10)) {
            await createNotification(
                'Low Stock Alert',
                `Medicine "${medicine.name}" is low on stock (${medicine.stock} units).`,
                'low_stock'
            );
        }

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { error: 'Failed to update stock' };
    }
}
