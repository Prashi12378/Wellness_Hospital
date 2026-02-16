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
        const now = new Date();
        // Adjust to IST (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        istTime.setUTCHours(0, 0, 0, 0);
        const today = new Date(istTime.getTime() - istOffset);

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
