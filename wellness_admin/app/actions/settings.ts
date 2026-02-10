'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPharmacySettings() {
    try {
        let settings = await prisma.pharmacySettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.pharmacySettings.create({
                data: {
                    id: 'default',
                    defaultGstRate: 5
                }
            });
        }

        return {
            success: true,
            settings: {
                ...settings,
                defaultGstRate: Number(settings.defaultGstRate)
            }
        };
    } catch (error) {
        console.error('Error fetching pharmacy settings:', error);
        return { success: false, error: 'Failed to fetch settings' };
    }
}

export async function updatePharmacySettings(data: { defaultGstRate: number }) {
    try {
        const settings = await prisma.pharmacySettings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                defaultGstRate: data.defaultGstRate
            },
            update: {
                defaultGstRate: data.defaultGstRate
            }
        });

        revalidatePath('/dashboard/settings');
        return {
            success: true,
            settings: {
                ...settings,
                defaultGstRate: Number(settings.defaultGstRate)
            }
        };
    } catch (error) {
        console.error('Error updating pharmacy settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
