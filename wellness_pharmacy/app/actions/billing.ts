'use server';

import { prisma as db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function searchMedicines(query: string) {
    if (!query) return { data: [] };

    try {
        const medicines = await db.pharmacyInventory.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { batchNo: { contains: query, mode: 'insensitive' } }
                ],
                stock: {
                    gt: 0,
                },
            },
            take: 10,
        });

        const serialized = medicines.map(m => ({
            ...m,
            price: Number(m.price),
            gstRate: Number(m.gstRate),
        }));

        return { data: serialized };
    } catch (error) {
        console.error('Search medicines error:', error);
        return { error: 'Search failed' };
    }
}

export async function createInvoice(data: {
    patientName: string;
    patientPhone?: string;
    doctorName?: string;
    insuranceNo?: string;
    items: any[];
    paymentMethod: string;
    discountRate?: number;
    discountAmount?: number;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { error: 'Authentication required to create invoice' };
        }

        // Generate Bill No (S-XXXXX format as per image)
        const lastInvoice = await db.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        let nextBillNo = 'S-10001';
        if (lastInvoice && lastInvoice.billNo.startsWith('S-')) {
            const lastNo = parseInt(lastInvoice.billNo.split('-')[1]);
            nextBillNo = `S-${lastNo + 1}`;
        }

        // Calculate totals
        let subTotal = 0;
        let totalGst = 0;

        console.log('Processing items for invoice:', data.items.length);

        const invoiceItems = data.items.map(item => {
            const qty = Number(item.qty);
            const mrp = Number(item.mrp);
            const gstRate = Number(item.gstRate || 0);
            const amount = Number((qty * mrp).toFixed(2));
            const gstAmount = Number(((amount * gstRate) / 100).toFixed(2));

            subTotal += amount;
            totalGst += gstAmount;

            console.log(`Item: ${item.name}, Qty: ${qty}, MRP: ${mrp}, GST: ${gstRate}%, Amount: ${amount}, GST Amt: ${gstAmount}`);

            return {
                medicineId: item.medicineId,
                name: item.name,
                hsnCode: item.hsnCode || '',
                batchNo: item.batchNo || 'NA',
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
                qty: qty,
                mrp: mrp,
                gstRate: gstRate,
                amount: amount,
            };
        });

        const discountAmount = Number(data.discountAmount || 0);
        const grandTotal = Number((subTotal + totalGst - discountAmount).toFixed(2));
        subTotal = Number(subTotal.toFixed(2));
        totalGst = Number(totalGst.toFixed(2));

        console.log('Final Totals:', { subTotal, totalGst, discountAmount, grandTotal });

        // Start transaction
        const invoice = await db.$transaction(async (tx) => {
            console.log('Creating invoice record with billNo:', nextBillNo);
            // 1. Create Invoice
            const newInvoice = await tx.invoice.create({
                data: {
                    billNo: nextBillNo,
                    patientName: data.patientName,
                    patientPhone: data.patientPhone,
                    doctorName: data.doctorName,
                    insuranceNo: data.insuranceNo,
                    subTotal: subTotal,
                    totalGst: totalGst,
                    grandTotal: grandTotal,
                    discountRate: Number(data.discountRate || 0),
                    discountAmount: discountAmount,
                    paymentMethod: data.paymentMethod,
                    items: {
                        create: invoiceItems
                    }
                } as any,
                include: {
                    items: true
                }
            }) as any; // Cast to any to avoid type issues with items after include if Prisma types are stale

            console.log('Invoice created, deducting stock...');

            // 2. Deduct Stock
            for (const item of data.items) {
                await tx.pharmacyInventory.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            decrement: Number(item.qty)
                        }
                    }
                });
            }

            console.log('Stock deduction complete.');

            // 3. Create Ledger Entry
            console.log('Creating ledger entry for pharmacy sale...');
            await tx.ledger.create({
                data: {
                    transactionType: 'income',
                    category: 'pharmacy',
                    description: `Pharmacy Sale - Bill #${nextBillNo} (${data.patientName})`,
                    amount: grandTotal,
                    paymentMethod: data.paymentMethod,
                    transactionDate: new Date(),
                    recordedBy: (session.user as any).id
                }
            });

            return newInvoice;
        });

        revalidatePath('/dashboard/billing');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');

        return {
            success: true,
            invoice: {
                ...invoice,
                subTotal: Number(invoice.subTotal),
                totalGst: Number(invoice.totalGst),
                grandTotal: Number(invoice.grandTotal),
                discountRate: Number(invoice.discountRate || 0),
                discountAmount: Number(invoice.discountAmount || 0),
                items: (invoice as any).items.map((item: any) => ({
                    ...item,
                    mrp: Number(item.mrp),
                    gstRate: Number(item.gstRate),
                    amount: Number(item.amount)
                }))
            }
        };
    } catch (error: any) {
        console.error('Create invoice error full details:', error);
        return { error: 'Failed to create invoice: ' + (error.message || 'Unknown error') };
    }
}

export async function getPharmacySettings() {
    try {
        const settings = await db.pharmacySettings.findUnique({
            where: { id: 'default' }
        });
        return {
            success: true,
            settings: settings ? {
                ...settings,
                defaultGstRate: Number(settings.defaultGstRate)
            } : { defaultGstRate: 5 } // Fallback if record not created yet
        };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { success: false, settings: { defaultGstRate: 5 } };
    }
}
export async function getInvoices() {
    try {
        const invoices = await db.invoice.findMany({
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const serialized = (invoices as any[]).map(invoice => ({
            ...invoice,
            subTotal: Number(invoice.subTotal),
            totalGst: Number(invoice.totalGst),
            grandTotal: Number(invoice.grandTotal),
            discountRate: Number(invoice.discountRate || 0),
            discountAmount: Number(invoice.discountAmount || 0),
            items: (invoice.items || []).map((item: any) => ({
                ...item,
                mrp: Number(item.mrp),
                gstRate: Number(item.gstRate),
                amount: Number(item.amount),
            }))
        }));

        return { success: true, invoices: serialized };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { success: false, error: 'Failed to fetch invoice history' };
    }
}
