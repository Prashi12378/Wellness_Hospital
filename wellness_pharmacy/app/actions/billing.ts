'use server';

import { prisma as db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function searchMedicines(query: string) {
    if (!query) return { data: [] };

    try {
        const medicines = await db.pharmacyInventory.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
                stock: {
                    gt: 0,
                },
            },
            take: 10,
        });

        const serialized = medicines.map(m => ({
            ...m,
            price: Number(m.price),
            gst_rate: Number(m.gst_rate),
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
}) {
    try {
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

        const grandTotal = Number((subTotal + totalGst).toFixed(2));
        subTotal = Number(subTotal.toFixed(2));
        totalGst = Number(totalGst.toFixed(2));

        console.log('Final Totals:', { subTotal, totalGst, grandTotal });

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
                    paymentMethod: data.paymentMethod,
                    items: {
                        create: invoiceItems
                    }
                },
                include: {
                    items: true
                }
            });

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
            return newInvoice;
        });

        revalidatePath('/dashboard/billing');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');

        return { success: true, invoice };
    } catch (error: any) {
        console.error('Create invoice error full details:', error);
        return { error: 'Failed to create invoice: ' + (error.message || 'Unknown error') };
    }
}
