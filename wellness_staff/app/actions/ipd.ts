'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { model } from "@/lib/gemini";
import { serializeData, formatMedicalDate } from "@/lib/serialization";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function safeRevalidatePath(path: string) {
    try {
        revalidatePath(path);
    } catch (e) {
        console.error("Revalidation failed:", e);
    }
}

export async function getAdmittedPatients(status?: string) {
    try {
        const admissions = await prisma.admission.findMany({
            where: status ? { status } : {},
            include: {
                patient: true,
                primaryDoctor: true
            },
            orderBy: { admissionDate: 'desc' }
        });
        return { success: true, admissions: serializeData(admissions) };
    } catch (error) {
        console.error("Failed to fetch admitted patients:", error);
        return { success: false, error: "Failed to fetch admitted patients" };
    }
}

export async function getAdmissionDetails(id: string) {
    try {
        const admission = await prisma.admission.findUnique({
            where: { id },
            include: {
                patient: true,
                primaryDoctor: true,
                HospitalCharge: { orderBy: { date: 'desc' } },
                LabRecord: { orderBy: { recordedAt: 'desc' } },
                Surgery: { orderBy: { surgeryDate: 'desc' } },
                ClinicalNote: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        // Remap PascalCase relation names to camelCase for the frontend
        const mapped = {
            ...admission,
            charges: admission.HospitalCharge,
            labRecords: admission.LabRecord,
            surgeries: admission.Surgery,
            clinicalNotes: admission.ClinicalNote
        };

        return { success: true, admission: serializeData(mapped) };
    } catch (error) {
        console.error("Failed to fetch admission details:", error);
        return { success: false, error: "Failed to fetch admission details" };
    }
}

export async function admitPatient(formData: {
    patientId: string;
    doctorId?: string;
    bedNumber?: string;
    ward?: string;
    admissionDate?: string;
}) {
    try {
        const { patientId, doctorId, bedNumber, ward, admissionDate } = formData;

        const admission = await prisma.admission.create({
            data: {
                id: randomUUID(),
                patientId,
                doctorId,
                bedNumber,
                ward,
                status: 'admitted',
                admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/dashboard/ipd');
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to admit patient:", error);
        return { success: false, error: "Failed to admit patient" };
    }
}

export async function updateAdmissionDates(admissionId: string, data: {
    admissionDate?: string;
    dischargeDate?: string;
}) {
    try {
        const updateData: any = { updatedAt: new Date() };
        if (data.admissionDate) updateData.admissionDate = new Date(data.admissionDate);
        if (data.dischargeDate) updateData.dischargeDate = new Date(data.dischargeDate);

        const admission = await prisma.admission.update({
            where: { id: admissionId },
            data: updateData
        });

        await safeRevalidatePath('/dashboard/ipd');
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}`);
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to update admission dates:", error);
        return { success: false, error: "Failed to update dates" };
    }
}

export async function addHospitalCharge(formData: {
    admissionId: string;
    description: string;
    amount: number;
    type: string;
    date?: string;
}) {
    try {
        const charge = await prisma.hospitalCharge.create({
            data: {
                id: randomUUID(),
                admissionId: formData.admissionId,
                description: formData.description,
                amount: formData.amount,
                type: formData.type,
                date: formData.date ? new Date(formData.date) : new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, charge: serializeData(charge) };
    } catch (error) {
        console.error("Failed to add charge:", error);
        return { success: false, error: "Failed to add charge" };
    }
}

export async function updateHospitalCharge(id: string, formData: {
    description: string;
    amount: number;
    type: string;
    admissionId: string;
    date?: string;
}) {
    try {
        const charge = await prisma.hospitalCharge.update({
            where: { id },
            data: {
                description: formData.description,
                amount: formData.amount,
                type: formData.type,
                date: formData.date ? new Date(formData.date) : undefined,
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, charge: serializeData(charge) };
    } catch (error) {
        console.error("Failed to update charge:", error);
        return { success: false, error: "Failed to update charge" };
    }
}

export async function addLabRecord(formData: {
    admissionId: string;
    testName: string;
    result?: string;
    fileUrl?: string;
    recordedAt?: string;
}) {
    try {
        const record = await prisma.labRecord.create({
            data: {
                id: randomUUID(),
                admissionId: formData.admissionId,
                testName: formData.testName,
                result: formData.result,
                fileUrl: formData.fileUrl,
                recordedAt: formData.recordedAt ? new Date(formData.recordedAt) : new Date()
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, record: serializeData(record) };
    } catch (error) {
        console.error("Failed to add lab record:", error);
        return { success: false, error: "Failed to add lab record" };
    }
}

export async function updateLabRecord(id: string, formData: {
    admissionId: string;
    testName: string;
    result?: string;
    recordedAt?: string;
}) {
    try {
        const record = await prisma.labRecord.update({
            where: { id },
            data: {
                testName: formData.testName,
                result: formData.result,
                recordedAt: formData.recordedAt ? new Date(formData.recordedAt) : undefined
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, record: serializeData(record) };
    } catch (error) {
        console.error("Failed to update lab record:", error);
        return { success: false, error: "Failed to update lab record" };
    }
}

export async function addSurgery(formData: {
    admissionId: string;
    surgeryName: string;
    surgeonName: string;
    surgeryDate: Date;
    notes?: string;
}) {
    try {
        const surgery = await prisma.surgery.create({
            data: {
                id: randomUUID(),
                admissionId: formData.admissionId,
                surgeryName: formData.surgeryName,
                surgeonName: formData.surgeonName,
                surgeryDate: formData.surgeryDate,
                notes: formData.notes
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, surgery: serializeData(surgery) };
    } catch (error) {
        console.error("Failed to add surgery:", error);
        return { success: false, error: "Failed to add surgery" };
    }
}

export async function updateSurgery(id: string, formData: {
    admissionId: string;
    surgeryName: string;
    surgeonName: string;
    surgeryDate: Date;
    notes?: string;
}) {
    try {
        const surgery = await prisma.surgery.update({
            where: { id },
            data: {
                surgeryName: formData.surgeryName,
                surgeonName: formData.surgeonName,
                surgeryDate: formData.surgeryDate,
                notes: formData.notes
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, surgery: serializeData(surgery) };
    } catch (error) {
        console.error("Failed to update surgery:", error);
        return { success: false, error: "Failed to update surgery" };
    }
}

export async function addClinicalNote(formData: {
    admissionId: string;
    doctorName: string;
    note: string;
    type: string;
    fileUrl?: string;
    createdAt?: string;
}) {
    try {
        const clinicalNote = await prisma.clinicalNote.create({
            data: {
                id: randomUUID(),
                admissionId: formData.admissionId,
                doctorName: formData.doctorName,
                note: formData.note,
                type: formData.type,
                fileUrl: formData.fileUrl,
                createdAt: formData.createdAt ? new Date(formData.createdAt) : new Date()
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, clinicalNote: serializeData(clinicalNote) };
    } catch (error) {
        console.error("Failed to add clinical note:", error);
        return { success: false, error: "Failed to add clinical note" };
    }
}

export async function updateClinicalNote(id: string, formData: {
    admissionId: string;
    doctorName: string;
    note: string;
    type: string;
    createdAt?: string;
}) {
    try {
        const clinicalNote = await prisma.clinicalNote.update({
            where: { id },
            data: {
                doctorName: formData.doctorName,
                note: formData.note,
                type: formData.type,
                createdAt: formData.createdAt ? new Date(formData.createdAt) : undefined
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, clinicalNote: serializeData(clinicalNote) };
    } catch (error) {
        console.error("Failed to update clinical note:", error);
        return { success: false, error: "Failed to update clinical note" };
    }
}

export async function dischargePatient(admissionId: string, data?: {
    diagnoses?: string;
    presentingSymptoms?: string;
    physicalFindings?: string;
    investigations?: string;
    hospitalCourse?: string;
    dischargeMedication?: string;
    dischargeCondition?: string;
    dischargeAdvice?: string;
    noteAndReview?: string;
    doctorDesignation?: string;
    paymentMethod?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Get admission and patient info for ledger description
        const admissionWithPatient = await prisma.admission.findUnique({
            where: { id: admissionId },
            include: {
                patient: true,
                HospitalCharge: true
            }
        });

        if (!admissionWithPatient) {
            return { success: false, error: "Admission not found" };
        }

        // 2. Calculate Total Bill
        const totalAmount = admissionWithPatient.HospitalCharge.reduce((sum, charge) => sum + Number(charge.amount), 0);
        const paymentMethod = data?.paymentMethod || 'CASH';

        // 3. Perform atomic update and ledger recording
        const [admission] = await prisma.$transaction([
            prisma.admission.update({
                where: { id: admissionId },
                data: {
                    status: 'discharged',
                    dischargeDate: new Date(),
                    updatedAt: new Date(),
                    diagnoses: data?.diagnoses,
                    presentingSymptoms: data?.presentingSymptoms,
                    physicalFindings: data?.physicalFindings,
                    investigations: data?.investigations,
                    hospitalCourse: data?.hospitalCourse,
                    dischargeMedication: data?.dischargeMedication,
                    dischargeCondition: data?.dischargeCondition,
                    dischargeAdvice: data?.dischargeAdvice,
                    noteAndReview: data?.noteAndReview,
                    doctorDesignation: data?.doctorDesignation
                }
            }),
            prisma.ledger.create({
                data: {
                    transactionType: 'income',
                    category: 'staff',
                    description: `IPD Discharge - Bill for ${admissionWithPatient.patient.firstName} ${admissionWithPatient.patient.lastName} (IP-${admissionId.slice(-6).toUpperCase()})`,
                    amount: totalAmount,
                    paymentMethod: paymentMethod,
                    transactionDate: new Date(),
                    recordedBy: (session.user as any).id
                }
            })
        ]);

        await safeRevalidatePath('/dashboard/ipd');
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}`);
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}/discharge-summary`);
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to discharge patient:", error);
        return { success: false, error: "Failed to discharge patient" };
    }
}

export async function updateDischargeSummary(admissionId: string, data: {
    diagnoses?: string;
    presentingSymptoms?: string;
    physicalFindings?: string;
    investigations?: string;
    hospitalCourse?: string;
    dischargeMedication?: string;
    dischargeCondition?: string;
    dischargeAdvice?: string;
    noteAndReview?: string;
    doctorDesignation?: string;
}) {
    try {
        const admission = await prisma.admission.update({
            where: { id: admissionId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });

        await safeRevalidatePath('/dashboard/ipd');
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}`);
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}/discharge-summary`);
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to update discharge summary:", error);
        return { success: false, error: "Failed to update discharge summary" };
    }
}

export async function generateAIDischargeSummary(admissionId: string) {
    try {
        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
            include: {
                patient: true,
                primaryDoctor: true,
                ClinicalNote: true,
                LabRecord: true,
                Surgery: true
            }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        const clinicalContext = `
            Patient Name: ${admission.patient.firstName} ${admission.patient.lastName}
            Age/Gender: ${admission.patient.dob ? (new Date().getFullYear() - new Date(admission.patient.dob).getFullYear()) : '--'}/${admission.patient.gender}
            
            Clinical Notes:
            ${admission.ClinicalNote.map((n: any) => `- [${n.type}] ${n.note}`).join('\n')}
            
            Lab Records:
            ${admission.LabRecord.map((l: any) => `- ${l.testName}: ${l.result || 'Analyzed'}`).join('\n')}
            
            Surgeries:
            ${admission.Surgery.map((s: any) => `- ${s.surgeryName} by ${s.surgeonName} on ${formatMedicalDate(s.surgeryDate, 'dd/MM/yyyy')}`).join('\n')}
        `;

        const prompt = `
            You are a senior physician at Wellness Hospital. Based on the following patient clinical context, generate a professional medical discharge summary.
            Return ONLY a JSON object with the following fields:
            {
                "diagnoses": "string (final diagnoses list, one per line)",
                "presentingSymptoms": "string (brief summary of complaints)",
                "physicalFindings": "string (summarized vitals and examination based on notes)",
                "investigations": "string (summary of lab/radiology findings)",
                "hospitalCourse": "string (narrative of treatment and progress)",
                "dischargeMedication": "string (list of recommended medications)",
                "dischargeCondition": "string (e.g., Stable/Improved)",
                "dischargeAdvice": "string (next steps, diet, activity)",
                "noteAndReview": "string (follow-up schedule)"
            }

            Context:
            ${clinicalContext}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean text in case of markdown blocks
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        const summary = JSON.parse(jsonStr);

        return { success: true, summary };
    } catch (error) {
        console.error("AI Summary Generation Failed:", error);
        return { success: false, error: "AI failed to generate summary" };
    }
}

export async function deleteAdmission(admissionId: string) {
    try {
        // First, unlink any invoices that might be associated with this admission
        await prisma.invoice.updateMany({
            where: { admissionId },
            data: { admissionId: null }
        });

        // Delete the admission record. 
        // Note: ClinicalNote, HospitalCharge, LabRecord, Surgery have onDelete: Cascade in Prisma schema
        await prisma.admission.delete({
            where: { id: admissionId }
        });

        await safeRevalidatePath('/dashboard/ipd');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete admission:", error);
        return { success: false, error: "Failed to delete IPD record" };
    }
}

export async function undoDischarge(admissionId: string) {
    try {
        await prisma.admission.update({
            where: { id: admissionId },
            data: {
                status: 'admitted',
                dischargeDate: null,
                diagnoses: null,
                dischargeAdvice: null,
                dischargeCondition: null,
                dischargeMedication: null,
                hospitalCourse: null,
                investigations: null,
                noteAndReview: null,
                physicalFindings: null,
                presentingSymptoms: null,
                updatedAt: new Date()
            }
        });

        await safeRevalidatePath('/dashboard/ipd');
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}`);
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}/discharge-summary`);
        return { success: true };
    } catch (error) {
        console.error("Failed to undo discharge:", error);
        return { success: false, error: "Failed to undo discharge" };
    }
}
