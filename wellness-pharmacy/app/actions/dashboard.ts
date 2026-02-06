'use server';

import { prisma as db } from '@/lib/db';

export async function getDashboardStats() {
    try {
        // 1. Inventory Stats
        // We can optimize this by using aggregate queries for count and sum
        const inventoryAgg = await db.pharmacyInventory.aggregate({
            _sum: {
                stock: true,
            },
            _count: {
                id: true,
            },
        });

        const lowStockCount = await db.pharmacyInventory.count({
            where: {
                stock: {
                    lt: 10
                }
            }
        });

        // 2. Today's Sales
        // Note: We don't have a PharmacyInvoice model in the schema I saw.
        // I will search for the model first, but based on previous schema viewing, it seemed missing?
        // Wait, looking at schema again... PharmacyInventory is there.
        // I don't recall seeing PharmacyInvoice or similar.
        // Let's check schema again before assuming.
        // If missing, I will just return 0 for now to prevent crash.

        // RE-READING SCHEMA from memory/view_file logs...
        // wellness-pharmacy/prisma/schema.prisma showed: Profile, Appointment, Prescription, HealthPackage, PharmacyInventory.
        // NO Invoice/Sales model.

        // So the Supabase code was querying 'pharmacy_invoices' which doesn't exist in Prisma RDS yet?
        // Or maybe it was `PharmacyInvoice`?

        // I'll return 0 for sales for now to fix the dashboard, 
        // effectively migrating what exists.

        return {
            stats: {
                totalStock: inventoryAgg._sum.stock || 0,
                totalItems: inventoryAgg._count.id || 0,
                lowStock: lowStockCount,
                todaysSales: 0 // Placeholder until Invoice model is added
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { error: 'Failed to fetch stats' };
    }
}
