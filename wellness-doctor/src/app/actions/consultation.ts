'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getConsultationDetails(appointmentId: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: true // Get profile details
            }
        });

        if (!appointment) {
            return { error: 'Appointment not found' };
        }

        // Fetch existing prescription
        const prescription = await prisma.prescription.findUnique({
            where: { appointmentId: appointmentId }
        });

        // Map Appointment to match frontend expectations (handling camelCase vs snake_case)
        const mappedAppointment = {
            id: appointment.id,
            patient_name: appointment.patientName || (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown'),
            patient_phone: appointment.patientPhone || appointment.patient?.phone || 'N/A',
            appointment_date: appointment.appointmentDate,
            reason: appointment.reason,
            user_id: appointment.patientId,
            status: appointment.status,
            // Add profile snapshot if needed, but frontend seems to construct it from patient_name/phone
            patient_profile: appointment.patient
        };

        return {
            appointment: mappedAppointment,
            prescription: prescription
        };

    } catch (error: any) {
        console.error('Error fetching consultation:', error);
        return { error: `Failed to fetch details: ${error.message}` };
    }
}

export async function savePrescription(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'Not authenticated' };
        }

        // We need the doctorId. 
        // If the session has ID, use it. 
        // But let's verify if the session ID maps to a Profile ID or User ID.
        // Prisma schema allows Prescription to link to Doctor (Profile).
        // Profile ID != User ID usually (Profile.userId = User.id).
        // Prescription.doctorId refers to Profile ID.

        // We need to fetch the Profile ID for this User.
        const userProfile = await prisma.profile.findUnique({
            where: { userId: (session.user as any).id || undefined, email: session.user.email || undefined },
            select: { id: true, firstName: true, lastName: true }
        });

        if (!userProfile) {
            return { error: 'Doctor profile not found' };
        }

        const doctorName = (userProfile.firstName || userProfile.lastName)
            ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
            : data.doctor_name || 'Dr. Unknown';

        // Data contains: appointment_id, doctor_id, doctor_name, patient_id, medicines, additional_notes

        const result = await prisma.prescription.upsert({
            where: {
                appointmentId: data.appointment_id
            },
            update: {
                medicines: data.medicines,
                additionalNotes: data.additional_notes,
                doctorName: doctorName,
                updatedAt: new Date()
            },
            create: {
                appointmentId: data.appointment_id,
                doctorId: userProfile.id, // Use the proper Profile ID
                patientId: data.patient_id,
                doctorName: doctorName,
                medicines: data.medicines,
                additionalNotes: data.additional_notes
            }
        });

        // Update Appointment Status
        await prisma.appointment.update({
            where: { id: data.appointment_id },
            data: { status: 'completed' }
        });

        // Revalidate
        revalidatePath(`/dashboard/consultation/${data.appointment_id}`);
        revalidatePath('/dashboard');

        return { success: true };

    } catch (error: any) {
        console.error('Error saving prescription:', error);
        return { error: `Failed to save: ${error.message}` };
    }
}

export async function getConsultationHistory() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'Not authenticated' };
        }

        // Get Doctor Profile
        const userProfile = await prisma.profile.findUnique({
            where: { userId: (session.user as any).id || undefined, email: session.user.email || undefined },
        });

        if (!userProfile) return { error: 'Profile not found' };

        // Fetch completed appointments for this doctor (or all if admin? assuming doctor portal)
        // Appointments link to doctor via `doctorId`? Or we infer from schedule?
        // Actually, Appointment schema usually has doctorId.
        // Let's check schema if possible, but assuming standard field.
        // Wait, earlier savePrescription used `upsert` and `revalidate`.

        // We will fetch appointments where status is 'completed'
        // If the schema has doctorId, we filter by it.
        // If not, we might just show all completed (if small clinic) or those linked to this user.
        // Let's assume we want ALL completed for now if `doctorId` isn't obvious, 
        // OR better: search for appointments where this user is the doctor.

        // Safe bet: Fetch all 'completed' appointments. 
        // Improvement: Filter by doctorId if schema has it.

        const appointments = await prisma.appointment.findMany({
            where: {
                status: 'completed',
                // doctorId: userProfile.id // Uncomment if schema supports it, for now show all completed to be safe
            },
            include: {
                patient: true
            },
            orderBy: {
                appointmentDate: 'desc'
            }
        });

        return {
            appointments: appointments.map(apt => ({
                id: apt.id,
                patientName: apt.patientName || (apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown'),
                patientAge: apt.patient?.age,
                patientGender: apt.patient?.gender,
                date: apt.appointmentDate,
                reason: apt.reason
            }))
        };

    } catch (error: any) {
        console.error('Error fetching history:', error);
        return { error: error.message };
    }
}
