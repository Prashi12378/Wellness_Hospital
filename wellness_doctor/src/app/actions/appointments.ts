'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getDoctorAppointments() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { error: 'Not authenticated' };

        const profileId = (session.user as any).profileId;
        if (!profileId) return { error: 'Doctor profile not found' };

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: profileId,
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

    } catch (error: any) {
        console.error('[AppointmentsAction] Error fetching appointments:', error);
        return { error: `Failed to fetch appointments: ${error.message || 'Unknown error'}` };
    }
}
