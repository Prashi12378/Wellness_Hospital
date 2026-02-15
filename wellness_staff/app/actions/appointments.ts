'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDoctors() {
    try {
        const doctors = await prisma.profile.findMany({
            where: { role: 'doctor' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true
            }
        });
        return { success: true, doctors };
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return { success: false, error: "Failed to fetch doctors" };
    }
}

export async function createDirectAppointment(formData: {
    patientId: string;
    doctorId: string;
    reason: string;
    department?: string;
}) {
    try {
        const { patientId, doctorId, reason, department } = formData;

        // Get patient details for snapshot
        const patient = await prisma.profile.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            return { success: false, error: "Patient not found" };
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                reason,
                department,
                patientName: `${patient.firstName} ${patient.lastName}`,
                patientPhone: patient.phone,
                patientEmail: patient.email,
                appointmentDate: new Date(), // Today for direct visit
                appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'scheduled',
                type: 'OPD'
            }
        });

        revalidatePath('/dashboard/appointments');
        return { success: true, appointment };
    } catch (error) {
        console.error("Failed to create appointment:", error);
        return { success: false, error: "Failed to create appointment" };
    }
}

export async function searchPatients(query: string) {
    try {
        const patients = await prisma.profile.findMany({
            where: {
                role: 'patient',
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                    { uhid: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5
        });
        return { success: true, patients };
    } catch (error) {
        console.error("Failed to search patients:", error);
        return { success: false, error: "Failed to search patients" };
    }
}
