'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/serialization";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getAppointmentBillingDetails(appointmentId: string) {
    try {
        const appointment = await (prisma.appointment as any).findUnique({
            where: { id: appointmentId },
            include: {
                patient: true,
                doctor: true,
                HospitalCharge: { orderBy: { date: 'desc' } },
                Invoice: { include: { items: true } }
            }
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        // Map back to charges/invoices for frontend compatibility
        const result = {
            ...appointment,
            charges: (appointment as any).HospitalCharge,
            invoices: (appointment as any).Invoice
        };

        return { success: true, appointment: serializeData(result) };
    } catch (error) {
        console.error("Failed to fetch appointment billing details:", error);
        return { success: false, error: "Failed to fetch details" };
    }
}

export async function addOPDCharge(formData: {
    appointmentId: string;
    description: string;
    amount: number;
    type: string;
    date?: string;
}) {
    try {
        const charge = await (prisma as any).hospitalCharge.create({
            data: {
                id: randomUUID(),
                appointmentId: formData.appointmentId,
                description: formData.description,
                amount: formData.amount,
                type: formData.type,
                date: formData.date ? new Date(formData.date) : new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/appointments/${formData.appointmentId}/billing`);
        return { success: true, charge: serializeData(charge) };
    } catch (error) {
        console.error("Failed to add charge:", error);
        return { success: false, error: "Failed to add charge" };
    }
}

export async function updateOPDCharge(id: string, formData: {
    description: string;
    amount: number;
    type: string;
    appointmentId: string;
    date?: string;
}) {
    try {
        const charge = await (prisma as any).hospitalCharge.update({
            where: { id },
            data: {
                description: formData.description,
                amount: formData.amount,
                type: formData.type,
                date: formData.date ? new Date(formData.date) : undefined,
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/appointments/${formData.appointmentId}/billing`);
        return { success: true, charge: serializeData(charge) };
    } catch (error) {
        console.error("Failed to update charge:", error);
        return { success: false, error: "Failed to update charge" };
    }
}

export async function deleteOPDCharge(id: string, appointmentId: string) {
    try {
        await prisma.hospitalCharge.delete({
            where: { id }
        });
        revalidatePath(`/dashboard/appointments/${appointmentId}/billing`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete charge:", error);
        return { success: false, error: "Failed to delete charge" };
    }
}

interface OPDInvoiceData {
    appointmentId: string;
    patientName: string;
    patientPhone?: string;
    doctorName?: string;
    subTotal: number;
    totalGst: number;
    grandTotal: number;
    paymentMethod: string;
    discountAmount?: number;
    depositAmount?: number;
    depositId?: string;
    items: {
        name: string;
        qty: number;
        mrp: number;
        gstRate: number;
        amount: number;
    }[];
    date?: string;
}

export async function generateOPDInvoice(data: OPDInvoiceData) {
    try {
        const billNo = `OPD-${Date.now().toString().slice(-6)}`;

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const invoice = await (prisma as any).invoice.create({
            data: {
                billNo,
                appointmentId: data.appointmentId || undefined,
                patientName: data.patientName,
                patientPhone: data.patientPhone,
                doctorName: data.doctorName,
                subTotal: data.subTotal,
                totalGst: data.totalGst,
                grandTotal: data.grandTotal,
                depositAmount: data.depositAmount || 0,
                paymentMethod: data.paymentMethod,
                discountAmount: data.discountAmount || 0,
                date: data.date ? new Date(data.date) : new Date(),
                status: 'PAID',
                items: {
                    create: data.items.map(item => ({
                        medicineId: 'SERVICE', // Marker for non-pharmacy items
                        name: item.name,
                        qty: item.qty,
                        mrp: item.mrp,
                        gstRate: item.gstRate,
                        amount: item.amount
                    }))
                }
            }
        });

        // 2. If advance payment was used, update its status
        if (data.depositId) {
            await (prisma as any).deposit.update({
                where: { id: data.depositId },
                data: {
                    status: 'CONSUMED',
                    invoiceId: invoice.id
                }
            });
        }

        // Record to Ledger
        await prisma.ledger.create({
            data: {
                transactionType: 'income',
                category: 'staff',
                description: `OPD Bill #${billNo} (${data.patientName})`,
                amount: data.grandTotal,
                paymentMethod: data.paymentMethod,
                transactionDate: new Date(),
                recordedBy: (session.user as any).id
            }
        });

        revalidatePath(`/dashboard/appointments/${data.appointmentId}/billing`);
        revalidatePath('/dashboard/billing');
        return { success: true, invoice: serializeData(invoice) };
    } catch (error: any) {
        console.error("Failed to generate invoice:", error);
        return { success: false, error: `Failed to generate invoice: ${error.message || 'Unknown error'}` };
    }
}

export async function getAllDoctors() {
    try {
        const doctors = await prisma.profile.findMany({
            where: { role: 'doctor' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
                consultationFee: true
            }
        });
        return { success: true, doctors: serializeData(doctors) };
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return { success: false, error: "Failed to fetch doctors" };
    }
}

interface ObservationInvoiceData {
    patientName: string;
    patientPhone?: string;
    patientId: string;
    doctorName?: string;
    subTotal: number;
    totalGst: number;
    grandTotal: number;
    paymentMethod: string;
    discountAmount?: number;
    observationHours?: number;
    ward?: string;
    depositAmount?: number;
    depositId?: string;
    items: {
        name: string;
        qty: number;
        mrp: number;
        gstRate: number;
        amount: number;
    }[];
    date?: string;
}

export async function generateObservationInvoice(data: ObservationInvoiceData) {
    try {
        const billNo = `OBS-${Date.now().toString().slice(-6)}`;

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const invoice = await (prisma as any).invoice.create({
            data: {
                billNo,
                patientName: data.patientName,
                patientPhone: data.patientPhone,
                doctorName: data.doctorName,
                subTotal: data.subTotal,
                totalGst: data.totalGst,
                grandTotal: data.grandTotal,
                depositAmount: data.depositAmount || 0,
                paymentMethod: data.paymentMethod,
                discountAmount: data.discountAmount || 0,
                ward: data.ward || undefined,
                date: data.date ? new Date(data.date) : new Date(),
                status: 'PAID',
                items: {
                    create: data.items.map((item: any) => ({
                        medicineId: 'OBSERVATION',
                        name: item.name,
                        qty: item.qty,
                        mrp: item.mrp,
                        gstRate: item.gstRate,
                        amount: item.amount
                    }))
                }
            }
        });

        // 2. If advance payment was used, update its status
        if (data.depositId) {
            await (prisma as any).deposit.update({
                where: { id: data.depositId },
                data: {
                    status: 'CONSUMED',
                    invoiceId: invoice.id
                }
            });
        }

        // Record to Ledger
        await prisma.ledger.create({
            data: {
                transactionType: 'income',
                category: 'staff',
                description: `Observation Bill #${billNo} (${data.patientName})`,
                amount: data.grandTotal,
                paymentMethod: data.paymentMethod,
                transactionDate: new Date(),
                recordedBy: (session.user as any).id
            }
        });

        revalidatePath('/dashboard/billing');
        return { success: true, invoice: serializeData(invoice) };
    } catch (error: any) {
        console.error("Failed to generate observation invoice:", error);
        return { success: false, error: `Failed to generate observation invoice: ${error.message || 'Unknown error'}` };
    }
}

export async function searchPatientsForBilling(query: string) {
    try {
        const patients = await prisma.profile.findMany({
            where: {
                role: 'patient',
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { uhid: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                ]
            },
            select: { id: true, firstName: true, lastName: true, uhid: true, phone: true },
            take: 10
        });
        return { success: true, patients: serializeData(patients) };
    } catch (error) {
        console.error('Failed to search patients:', error);
        return { success: false, error: 'Search failed' };
    }
}

export async function getRecentOPDAndObservationBills() {
    try {
        const invoices = await (prisma as any).invoice.findMany({
            where: {
                OR: [
                    { items: { some: { medicineId: 'SERVICE' } } },
                    { items: { some: { medicineId: 'OBSERVATION' } } },
                ]
            },
            include: { items: true },
            orderBy: { date: 'desc' },
            take: 50
        });
        return { success: true, invoices: serializeData(invoices) };
    } catch (error) {
        console.error('Failed to fetch recent bills:', error);
        return { success: false, error: 'Failed to fetch bills' };
    }
}

export async function getAllFrontDeskInvoices() {
    try {
        const invoices = await (prisma as any).invoice.findMany({
            where: {
                OR: [
                    { billNo: { startsWith: 'OPD-' } },
                    { billNo: { startsWith: 'OBS-' } },
                ]
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
        console.error('Error fetching invoices:', error);
        return { success: false, error: 'Failed to fetch invoice history' };
    }
}

export async function deleteObservationInvoice(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }
        
        const invoice = await prisma.invoice.findUnique({
            where: { id }
        });

        if (!invoice) return { success: false, error: "Invoice not found" };

        if (!invoice.billNo.startsWith('OBS-')) {
             return { success: false, error: "Only observation bills can be deleted" };
        }

        await prisma.invoice.delete({
            where: { id }
        });

        await prisma.ledger.deleteMany({
            where: { description: { startsWith: `Observation Bill #${invoice.billNo}` } }
        });

        revalidatePath('/dashboard/billing');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete observation invoice:", error);
        return { success: false, error: "Failed to delete observation invoice" };
    }
}
