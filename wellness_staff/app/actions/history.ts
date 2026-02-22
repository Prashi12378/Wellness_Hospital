'use server';

import { prisma } from "@/lib/db";
import { serializeData } from "@/lib/serialization";

export async function getPatientHistory(patientId: string) {
    try {
        const patient = await prisma.profile.findUnique({
            where: { id: patientId },
            include: {
                admissions: {
                    include: {
                        primaryDoctor: true,
                        ClinicalNote: { orderBy: { createdAt: 'desc' } },
                        HospitalCharge: { orderBy: { date: 'desc' } },
                        LabRecord: { orderBy: { recordedAt: 'desc' } },
                        Surgery: { orderBy: { surgeryDate: 'desc' } },
                        pharmacyInvoices: true
                    },
                    orderBy: { admissionDate: 'desc' }
                },
                appointmentsAsPatient: {
                    include: {
                        doctor: true,
                        prescription: true
                    },
                    orderBy: { appointmentDate: 'desc' }
                },
                labRequests: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!patient) {
            return { success: false, error: "Patient not found" };
        }

        // Map admissions and appointments for frontend compatibility
        const history = {
            patient: serializeData(patient),
            admissions: patient.admissions.map(adm => ({
                ...adm,
                clinicalNotes: adm.ClinicalNote,
                charges: adm.HospitalCharge,
                labRecords: adm.LabRecord,
                surgeries: adm.Surgery,
                invoices: adm.pharmacyInvoices
            })),
            appointments: patient.appointmentsAsPatient,
            labRequests: patient.labRequests
        };

        return { success: true, history: serializeData(history) };
    } catch (error) {
        console.error("Failed to fetch patient history:", error);
        return { success: false, error: "Failed to fetch patient history" };
    }
}

export async function searchPatientsForHistory(query: string) {
    try {
        if (!query || query.length < 2) return { success: true, patients: [] };

        const patients = await prisma.profile.findMany({
            where: {
                role: 'patient',
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                    { uhid: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            orderBy: { firstName: 'asc' }
        });
        return { success: true, patients: serializeData(patients) };
    } catch (error) {
        console.error("Patient history search failed:", error);
        return { success: false, error: "Failed to search patients" };
    }
}
