'use server';

import { prisma as db } from '@/lib/db';

export async function getDashboardStats() {
    try {
        // 1. Inventory Stats
        const inventoryAgg = await db.pharmacyInventory.aggregate({
            _sum: {
                stock: true,
            },
            _count: {
                id: true,
            },
        });

        // 2. Low Stock Count (Actual inventory check)
        const lowStockCount = await db.pharmacyInventory.count({
            where: {
                stock: {
                    lt: 10 // Default threshold
                }
            }
        });

        // 3. Today's Revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const salesAgg = await db.invoice.aggregate({
            where: {
                createdAt: {
                    gte: today
                }
            },
            _sum: {
                grandTotal: true
            }
        });

        return {
            stats: {
                totalStock: inventoryAgg._sum.stock || 0,
                totalItems: inventoryAgg._count.id || 0,
                lowStock: lowStockCount,
                todaysSales: Number(salesAgg._sum.grandTotal) || 0
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { error: 'Failed to fetch stats' };
    }
}
