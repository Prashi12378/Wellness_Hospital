'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function getPrescriptions() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        const prescriptions = await prisma.prescription.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        uhid: true,
                        gender: true,
                        dob: true
                    }
                },
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true
                    }
                }
            }
        });

        // Serialize the structured data
        const serialized = prescriptions.map((rx: any) => ({
            id: rx.id,
            appointmentId: rx.appointmentId,
            doctorId: rx.doctorId,
            patientId: rx.patientId,
            doctorName: rx.doctorName || `${rx.doctor?.firstName || ''} ${rx.doctor?.lastName || ''}`.trim(),
            doctorSpecialization: rx.doctor?.specialization || '',
            patientName: `${rx.patient?.firstName || ''} ${rx.patient?.lastName || ''}`.trim(),
            patientPhone: rx.patient?.phone || '',
            patientUhid: rx.patient?.uhid || '',
            patientGender: rx.patient?.gender || '',
            patientAge: rx.patient?.dob ? Math.abs(new Date(Date.now() - new Date(rx.patient.dob).getTime()).getUTCFullYear() - 1970) : null,
            date: rx.date.toISOString(),
            medicines: Array.isArray(rx.medicines) ? rx.medicines : (rx.medicines ? JSON.parse(rx.medicines) : []),
            additionalNotes: rx.additionalNotes
        }));

        return { success: true, data: serialized };
    } catch (error: any) {
        console.error('getPrescriptions Error:', error);
        return { success: false, error: error.message || 'Failed to fetch prescriptions' };
    }
}
