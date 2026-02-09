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

        // Get unread low stock notifications from the database
        const lowStockAlerts = await db.notification.count({
            where: {
                type: 'low_stock',
                read: false
            }
        });

        return {
            stats: {
                totalStock: inventoryAgg._sum.stock || 0,
                totalItems: inventoryAgg._count.id || 0,
                lowStock: lowStockAlerts,
                todaysSales: 0
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { error: 'Failed to fetch stats' };
    }
}
