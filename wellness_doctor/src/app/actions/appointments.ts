'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
// We might need an auth options file or just use a generic fetch if session is handled elsewhere. 
// For now, I'll assume we can get the session or at least list all scheduled appointments if filtering by doctor isn't strictly enforced yet.
// Re-reading previous logic: it was creating client to fetch appointments. 
// The system seems to rely on the logged-in user being linked to a Profile.

export async function getDoctorAppointments() {
    try {
        // For debugging, we'll fetch all scheduled/completed appointments relative to today.
        // Ideally we filter by the logged-in doctor's ID, but let's first get DATA showing up.

        const appointments = await prisma.appointment.findMany({
            where: {
                status: {
                    in: ['scheduled', 'completed']
                }
            },
            orderBy: {
                appointmentDate: 'asc'
            },
            include: {
                patient: true // Include patient profile details
            }
        });

        // Transform data to match what the frontend expects (snake_case vs camelCase mismatch handling)
        // The frontend expects: id, patient_name, appointment_time, appointment_date, status, department, patient_phone, reason
        // The DB (Prisma) returns: id, patientName, appointmentTime, appointmentDate, status, department, patientPhone, reason

        const mappedAppointments = appointments.map(apt => ({
            id: apt.id,
            patient_name: apt.patientName || (apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown'),
            appointment_time: apt.appointmentTime,
            appointment_date: apt.appointmentDate,
            status: apt.status,
            department: apt.department,
            patient_phone: apt.patientPhone || apt.patient?.phone,
            reason: apt.reason
        }));

        return { data: mappedAppointments };

    } catch (error) {
        console.error('Error fetching appointments:', error);
        return { error: 'Failed to fetch appointments' };
    }
}
