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

export async function searchPatients(query: string) {
    if (!query) return { data: [] };

    try {
        const patients = await db.profile.findMany({
            where: {
                role: 'patient',
                OR: [
                    { phone: { contains: query } },
                    { uhid: { contains: query, mode: 'insensitive' } },
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 5,
        });

        return { data: patients };
    } catch (error) {
        console.error('Search patients error:', error);
        return { error: 'Search failed' };
    }
}

export async function createInvoice(data: {
    patientName: string;
    patientPhone?: string;
    doctorName?: string;
    insuranceNo?: string;
    admissionId?: string; // Optional: Link to IPD admission
    items: any[];
    paymentMethod: string;
    discountRate?: number;
    discountAmount?: number;
    date?: Date | string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { error: 'Authentication required to create invoice' };
        }

        // Generate Bill No (S-XXXXX format as per image)
        const lastInvoice = await db.invoice.findFirst({
            where: {
                billNo: {
                    startsWith: 'S-'
                }
            },
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

            // MRP is GST-inclusive: extract base price and GST from MRP
            const basePrice = mrp / (1 + gstRate / 100);
            const amount = Number((qty * mrp).toFixed(2));                    // total paid = qty × MRP
            const gstAmount = Number(((mrp - basePrice) * qty).toFixed(2));   // GST extracted from MRP

            subTotal += Number((qty * basePrice).toFixed(4));   // pre-GST subtotal
            totalGst += gstAmount;

            // console.log(`Item: ${item.name}, Qty: ${qty}, MRP: ${mrp}, GST: ${gstRate}%, Amount: ${amount}, GST Amt: ${gstAmount}`);

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
                    admissionId: data.admissionId,
                    date: data.date ? new Date(data.date) : new Date(),
                    subTotal: subTotal,
                    totalGst: totalGst,
                    grandTotal: grandTotal,
                    discountRate: Number(data.discountRate || 0),
                    discountAmount: discountAmount,
                    paymentMethod: data.paymentMethod,
                    status: data.paymentMethod === 'CREDIT' ? 'UNPAID' : 'PAID',
                    items: {
                        create: invoiceItems
                    }
                } as any,
                include: {
                    items: true
                }
            }) as any;

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

            // 3. Handle Payment Logic
            if (data.paymentMethod === 'CREDIT' && data.admissionId) {
                console.log('Creating hospital charge for IPD Credit...');
                await tx.hospitalCharge.create({
                    data: {
                        admissionId: data.admissionId,
                        description: `Pharmacy Bill #${nextBillNo}`,
                        amount: grandTotal,
                        type: 'medicine',
                        date: new Date(),
                    }
                });
                // No Ledger entry for Credit bills (revenue recognized at discharge/settlement)
            } else {
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
            }

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
            where: {
                billNo: {
                    startsWith: 'S-'
                }
            },
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

export async function searchAdmittedPatients(query: string) {
    if (!query) return { data: [] };

    try {
        const admissions = await db.admission.findMany({
            where: {
                status: 'admitted',
                patient: {
                    OR: [
                        { phone: { contains: query } },
                        { uhid: { contains: query, mode: 'insensitive' } },
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                    ],
                }
            },
            take: 5,
            include: {
                patient: true,
                primaryDoctor: true
            }
        });

        const serialized = admissions.map(adm => ({
            id: adm.patient.id, // Use patient ID for selection
            admissionId: adm.id,
            firstName: adm.patient.firstName,
            lastName: adm.patient.lastName,
            phone: adm.patient.phone,
            uhid: adm.patient.uhid,
            doctorName: adm.primaryDoctor ? `${adm.primaryDoctor.firstName} ${adm.primaryDoctor.lastName}` : '',
            bedNumber: adm.bedNumber,
            ward: adm.ward,
        }));

        return { data: serialized };
    } catch (error) {
        console.error('Search admitted patients error:', error);
        return { error: 'Search failed' };
    }
}
export async function deleteInvoice(invoiceId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { error: 'Authentication required' };
        }

        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true }
        });

        if (!invoice) return { error: 'Invoice not found' };
        if (invoice.status === 'RETURNED') return { error: 'Already returned, cannot delete' };

        await db.$transaction(async (tx) => {
            // 1. Restore Stock
            for (const item of invoice.items) {
                await tx.pharmacyInventory.updateMany({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            increment: item.qty
                        }
                    }
                });
            }

            // 2. Remove Financial Records
            if (invoice.paymentMethod === 'CREDIT' && invoice.admissionId) {
                await tx.hospitalCharge.deleteMany({
                    where: {
                        admissionId: invoice.admissionId,
                        description: `Pharmacy Bill #${invoice.billNo}`
                    }
                });
            } else {
                await tx.ledger.deleteMany({
                    where: {
                        description: {
                            contains: `Bill #${invoice.billNo}`
                        }
                    }
                });
            }

            // 3. Delete Invoice (Cascade will handle items if configured, but let's be explicit if not sure)
            await tx.invoice.delete({
                where: { id: invoiceId }
            });
        });

        revalidatePath('/dashboard/billing');
        revalidatePath('/dashboard/history');
        revalidatePath('/dashboard/inventory');

        return { success: true };
    } catch (error: any) {
        console.error('Delete invoice error:', error);
        return { error: 'Failed to delete: ' + (error.message || 'Unknown error') };
    }
}

export async function returnInvoice(invoiceId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { error: 'Authentication required' };
        }

        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true }
        });

        if (!invoice) return { error: 'Invoice not found' };
        if (invoice.status === 'RETURNED') return { error: 'Already returned' };

        await db.$transaction(async (tx) => {
            // 1. Restore Stock
            for (const item of invoice.items) {
                await tx.pharmacyInventory.updateMany({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            increment: item.qty
                        }
                    }
                });
            }

            // 2. Update Invoice Status
            await tx.invoice.update({
                where: { id: invoiceId },
                data: { status: 'RETURNED' }
            });

            // 3. Add reversal ledger entry
            if (invoice.paymentMethod !== 'CREDIT') {
                await tx.ledger.create({
                    data: {
                        transactionType: 'expense',
                        category: 'pharmacy',
                        description: `Return - Bill #${invoice.billNo} (${invoice.patientName})`,
                        amount: invoice.grandTotal,
                        paymentMethod: invoice.paymentMethod,
                        transactionDate: new Date(),
                        recordedBy: (session.user as any).id
                    }
                });
            } else if (invoice.admissionId) {
                await tx.hospitalCharge.create({
                    data: {
                        admissionId: invoice.admissionId,
                        description: `Return - Pharmacy Bill #${invoice.billNo}`,
                        amount: -invoice.grandTotal,
                        type: 'medicine',
                        date: new Date(),
                    }
                });
            }
        });

        revalidatePath('/dashboard/billing');
        revalidatePath('/dashboard/history');
        revalidatePath('/dashboard/inventory');

        return { success: true };
    } catch (error: any) {
        console.error('Return invoice error:', error);
        return { error: 'Failed to return: ' + (error.message || 'Unknown error') };
    }
}

export async function returnInvoiceItems(invoiceId: string, itemIds: string[]) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { error: 'Authentication required' };
        }

        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true }
        });

        if (!invoice) return { error: 'Invoice not found' };
        if (invoice.status === 'RETURNED') return { error: 'Invoice already fully returned' };

        const itemsToReturn = invoice.items.filter(item => itemIds.includes(item.id));
        if (itemsToReturn.length === 0) return { error: 'No items selected to return' };

        // Check if we are returning all items
        const isReturningAll = itemsToReturn.length === invoice.items.length;

        await db.$transaction(async (tx) => {
            let totalReturnAmount = 0;

            // 1. Restore Stock for selected items
            for (const item of itemsToReturn) {
                await tx.pharmacyInventory.updateMany({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            increment: item.qty
                        }
                    }
                });
                totalReturnAmount += Number(item.amount);
            }

            // Calculate proportional discount for the returned amount if there was a discount
            let actualRefundAmount = totalReturnAmount;
            if (Number(invoice.discountRate) > 0) {
                // If there's a discount rate, the refund should be the discounted amount
                actualRefundAmount = Number((totalReturnAmount * (1 - Number(invoice.discountRate) / 100)).toFixed(2));
            } else if (Number(invoice.discountAmount) > 0) {
                // Proportional discount based on subtotal
                const totalInvoiceBeforeDiscount = Number(invoice.subTotal) + Number(invoice.totalGst);
                const discountRatio = Number(invoice.discountAmount) / totalInvoiceBeforeDiscount;
                actualRefundAmount = Number((totalReturnAmount * (1 - discountRatio)).toFixed(2));
            }

            // 2. Remove items or update invoice
            if (isReturningAll) {
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: { status: 'RETURNED' }
                });
            } else {
                // Delete the items from the invoice
                await tx.invoiceItem.deleteMany({
                    where: {
                        id: { in: itemIds }
                    }
                });

                // Recalculate remaining invoice totals
                const remainingItems = invoice.items.filter(item => !itemIds.includes(item.id));

                let newSubTotal = 0;
                let newTotalGst = 0;

                remainingItems.forEach(item => {
                    const mrp = Number(item.mrp);
                    const gstRate = Number(item.gstRate);
                    const qty = Number(item.qty);

                    const basePrice = mrp / (1 + gstRate / 100);
                    const gstAmount = (mrp - basePrice) * qty;

                    newSubTotal += basePrice * qty;
                    newTotalGst += gstAmount;
                });

                // Apply original discount rate or proportional discount amount
                let newDiscountAmount = 0;
                if (Number(invoice.discountRate) > 0) {
                    newDiscountAmount = Number(((newSubTotal + newTotalGst) * (Number(invoice.discountRate) / 100)).toFixed(2));
                } else if (Number(invoice.discountAmount) > 0) {
                    const totalInvoiceBeforeDiscount = Number(invoice.subTotal) + Number(invoice.totalGst);
                    const discountRatio = Number(invoice.discountAmount) / totalInvoiceBeforeDiscount;
                    newDiscountAmount = Number(((newSubTotal + newTotalGst) * discountRatio).toFixed(2));
                }

                const newGrandTotal = Number((newSubTotal + newTotalGst - newDiscountAmount).toFixed(2));

                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        subTotal: Number(newSubTotal.toFixed(2)),
                        totalGst: Number(newTotalGst.toFixed(2)),
                        grandTotal: newGrandTotal,
                        discountAmount: newDiscountAmount
                    }
                });
            }

            // 3. Add reversal ledger entry for the REFUNDED items
            if (invoice.paymentMethod !== 'CREDIT') {
                await tx.ledger.create({
                    data: {
                        transactionType: 'expense',
                        category: 'pharmacy',
                        description: `Partial Return - Bill #${invoice.billNo} (${itemsToReturn.map(i => i.name).join(', ')})`,
                        amount: actualRefundAmount,
                        paymentMethod: invoice.paymentMethod,
                        transactionDate: new Date(),
                        recordedBy: (session.user as any).id
                    }
                });
            } else if (invoice.admissionId) {
                await tx.hospitalCharge.create({
                    data: {
                        admissionId: invoice.admissionId,
                        description: `Medicine Return - Bill #${invoice.billNo}`,
                        amount: -actualRefundAmount,
                        type: 'medicine',
                        date: new Date(),
                    }
                });
            }
        });

        revalidatePath('/dashboard/billing');
        revalidatePath('/dashboard/history');
        revalidatePath('/dashboard/inventory');

        return { success: true };
    } catch (error: any) {
        console.error('Partial return error:', error);
        return { error: 'Failed to process partial return: ' + (error.message || 'Unknown error') };
    }
}
