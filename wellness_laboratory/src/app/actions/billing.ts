"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/serialization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface LabInvoiceData {
    patientName: string;
    patientPhone?: string;
    doctorName?: string;
    subTotal: number;
    totalGst: number;
    discountAmount?: number;
    discountRate?: number;
    grandTotal: number;
    depositAmount?: number;
    depositId?: string;
    paymentMethod: string;
    items: any[];
    requestIds?: string[];
}

export async function createLabInvoice(data: LabInvoiceData) {
    try {
        // Generate a unique Bill Number
        const currentYear = new Date().getFullYear();
        const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
        const lastInvoice = await prisma.invoice.findFirst({
            where: { billNo: { startsWith: `LAB/${datePrefix}` } },
            orderBy: { billNo: "desc" },
        });

        let sequence = 1;
        if (lastInvoice && lastInvoice.billNo) {
            const parts = lastInvoice.billNo.split("-");
            if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
                sequence = parseInt(parts[1]) + 1;
            }
        }

        const billNo = `LAB/${datePrefix}-${sequence.toString().padStart(4, "0")}`;

        const invoice = await (prisma as any).invoice.create({
            data: {
                billNo,
                patientName: data.patientName,
                patientPhone: data.patientPhone || null,
                doctorName: data.doctorName || "Self-Referred",
                subTotal: data.subTotal,
                totalGst: data.totalGst,
                discountAmount: data.discountAmount || 0,
                discountRate: data.discountRate || 0,
                grandTotal: data.grandTotal,
                depositAmount: data.depositAmount || 0,
                paymentMethod: data.paymentMethod,
                status: data.paymentMethod === "CREDIT" ? "PENDING" : "PAID",
                items: {
                    create: data.items.map((item: any) => ({
                        medicineId: "LAB_TEST",
                        name: item.name,
                        qty: 1, // Usually 1 test of a kind
                        mrp: item.price,
                        gstRate: item.gstRate || 0,
                        amount: item.amount,
                    })),
                },
                // Link any existing LabRequests to this invoice
                labRequests: data.requestIds ? {
                    connect: data.requestIds.map((id: string) => ({ id }))
                } : undefined
            },
            include: {
                items: true,
                labRequests: true
            },
        });

        // Update Deposit if used
        if (data.depositId) {
            await (prisma as any).deposit.update({
                where: { id: data.depositId },
                data: {
                    status: 'CONSUMED',
                    invoiceId: invoice.id
                }
            });
        }

        // Mark LabRequests as billed
        if (data.requestIds && data.requestIds.length > 0) {
            await prisma.labRequest.updateMany({
                where: { id: { in: data.requestIds } },
                data: { isBilled: true }
            });
        }

        // Also record it in the Ledger if paid immediately
        if (invoice.status === "PAID") {
            const systemUser = await prisma.user.findFirst({ where: { profile: { role: 'admin' } } }); // Or get current user session
            if (systemUser) {
                await prisma.ledger.create({
                    data: {
                        transactionType: "income",
                        category: "lab",
                        description: `Invoice ${billNo} - ${data.patientName}`,
                        amount: data.grandTotal,
                        paymentMethod: data.paymentMethod,
                        transactionDate: new Date(),
                        recordedBy: systemUser.id,
                    }
                });
            }
        }

        revalidatePath("/dashboard/billing");
        revalidatePath("/dashboard"); // Also revalidate main dashboard to update unbilled counts
        return { success: true, invoice: serializeData(invoice) };
    } catch (error: any) {
        console.error("Error creating lab invoice:", error);
        return { success: false, error: error.message || "Failed to create invoice" };
    }
}

export async function getLabInvoices() {
    try {
        const invoices = await (prisma as any).invoice.findMany({
            where: {
                billNo: { startsWith: 'LAB/' }
            },
            include: {
                items: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        const serialized = (invoices as any[]).map(invoice => ({
            ...invoice,
            date: invoice.date ? invoice.date.toISOString() : null,
            createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
            updatedAt: invoice.updatedAt ? invoice.updatedAt.toISOString() : null,
            subTotal: Number(invoice.subTotal || 0),
            totalGst: Number(invoice.totalGst || 0),
            grandTotal: Number(invoice.grandTotal || 0),
            discountAmount: Number(invoice.discountAmount || 0),
            depositAmount: Number(invoice.depositAmount || 0),
            items: (invoice.items || []).map((item: any) => ({
                ...item,
                mrp: Number(item.mrp || 0),
                gstRate: Number(item.gstRate || 0),
                amount: Number(item.amount || 0),
            }))
        }));

        return { success: true, invoices: serialized };
    } catch (error) {
        console.error('Error fetching lab invoices:', error);
        return { success: false, error: 'Failed to fetch invoice history' };
    }
}

export async function clearLabInvoicePayment(invoiceId: string, paymentMethod: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const invoice = await (prisma as any).invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) return { success: false, error: "Invoice not found" };

        const updatedInvoice = await (prisma as any).invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paymentMethod: paymentMethod,
                updatedAt: new Date()
            }
        });

        // Record to Ledger now that it's paid
        await prisma.ledger.create({
            data: {
                transactionType: 'income',
                category: 'lab',
                description: `Payment Cleared - ${invoice.billNo} (${invoice.patientName})`,
                amount: invoice.grandTotal,
                paymentMethod: paymentMethod,
                transactionDate: new Date(),
                recordedBy: (session.user as any).id
            }
        });

        revalidatePath('/dashboard/billing');
        return { success: true, invoice: serializeData(updatedInvoice) };
    } catch (error: any) {
        console.error("Failed to clear lab invoice payment:", error);
        return { success: false, error: `Failed to clear payment: ${error.message || 'Unknown error'}` };
    }
}
