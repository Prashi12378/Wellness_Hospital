'use server';

import { prisma as db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
    try {
        const notifications = await db.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });
        return { notifications };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return { error: 'Failed to fetch notifications' };
    }
}

export async function getUnreadCount() {
    try {
        const count = await db.notification.count({
            where: {
                read: false
            }
        });
        return { count };
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return { count: 0 };
    }
}

export async function markAsRead(id: string) {
    try {
        await db.notification.update({
            where: { id },
            data: { read: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { error: 'Failed to mark as read' };
    }
}

export async function markAllAsRead() {
    try {
        await db.notification.updateMany({
            where: { read: false },
            data: { read: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking all as read:', error);
        return { error: 'Failed to mark all as read' };
    }
}

export async function createNotification(title: string, message: string, type: string) {
    try {
        const notification = await db.notification.create({
            data: {
                title,
                message,
                type
            }
        });
        revalidatePath('/dashboard');
        return { notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { error: 'Failed to create notification' };
    }
}
