'use server';
// Force type refresh

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
    items: {
        name: string;
        qty: number;
        mrp: number;
        gstRate: number;
        amount: number;
    }[];
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
                appointmentId: data.appointmentId,
                patientName: data.patientName,
                patientPhone: data.patientPhone,
                doctorName: data.doctorName,
                subTotal: data.subTotal,
                totalGst: data.totalGst,
                grandTotal: data.grandTotal,
                paymentMethod: data.paymentMethod,
                discountAmount: data.discountAmount || 0,
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
        return { success: true, invoice: serializeData(invoice) };
    } catch (error) {
        console.error("Failed to generate invoice:", error);
        return { success: false, error: "Failed to generate invoice" };
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
