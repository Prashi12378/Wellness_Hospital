'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { model } from "@/lib/gemini";
import { serializeData, formatMedicalDate } from "@/lib/serialization";

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
                charges: { orderBy: { date: 'desc' } },
                labRecords: { orderBy: { recordedAt: 'desc' } },
                surgeries: { orderBy: { surgeryDate: 'desc' } },
                clinicalNotes: { orderBy: { createdAt: 'desc' } }
            }
        });
        return { success: true, admission: serializeData(admission) };
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
}) {
    try {
        const { patientId, doctorId, bedNumber, ward } = formData;

        const admission = await prisma.admission.create({
            data: {
                patientId,
                doctorId,
                bedNumber,
                ward,
                status: 'admitted'
            }
        });

        revalidatePath('/dashboard/ipd');
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to admit patient:", error);
        return { success: false, error: "Failed to admit patient" };
    }
}

export async function addHospitalCharge(formData: {
    admissionId: string;
    description: string;
    amount: number;
    type: string;
}) {
    try {
        const charge = await prisma.hospitalCharge.create({
            data: {
                admissionId: formData.admissionId,
                description: formData.description,
                amount: formData.amount,
                type: formData.type
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, charge: serializeData(charge) };
    } catch (error) {
        console.error("Failed to add charge:", error);
        return { success: false, error: "Failed to add charge" };
    }
}

export async function addLabRecord(formData: {
    admissionId: string;
    testName: string;
    result?: string;
    fileUrl?: string;
}) {
    try {
        const record = await prisma.labRecord.create({
            data: {
                admissionId: formData.admissionId,
                testName: formData.testName,
                result: formData.result,
                fileUrl: formData.fileUrl
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, record: serializeData(record) };
    } catch (error) {
        console.error("Failed to add lab record:", error);
        return { success: false, error: "Failed to add lab record" };
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

export async function addClinicalNote(formData: {
    admissionId: string;
    doctorName: string;
    note: string;
    type: string;
    fileUrl?: string;
}) {
    try {
        const clinicalNote = await prisma.clinicalNote.create({
            data: {
                admissionId: formData.admissionId,
                doctorName: formData.doctorName,
                note: formData.note,
                type: formData.type,
                fileUrl: formData.fileUrl
            }
        });

        revalidatePath(`/dashboard/ipd/${formData.admissionId}`);
        return { success: true, clinicalNote: serializeData(clinicalNote) };
    } catch (error) {
        console.error("Failed to add clinical note:", error);
        return { success: false, error: "Failed to add clinical note" };
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
}) {
    try {
        const admission = await prisma.admission.update({
            where: { id: admissionId },
            data: {
                status: 'discharged',
                dischargeDate: new Date(),
                ...data
            }
        });

        await safeRevalidatePath('/dashboard/ipd');
        await safeRevalidatePath(`/dashboard/ipd/${admissionId}`);
        return { success: true, admission: serializeData(admission) };
    } catch (error) {
        console.error("Failed to discharge patient:", error);
        return { success: false, error: "Failed to discharge patient" };
    }
}

export async function generateAIDischargeSummary(admissionId: string) {
    try {
        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
            include: {
                patient: true,
                primaryDoctor: true,
                clinicalNotes: true,
                labRecords: true,
                surgeries: true
            }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        const clinicalContext = `
            Patient Name: ${admission.patient.firstName} ${admission.patient.lastName}
            Age/Gender: ${admission.patient.dob ? (new Date().getFullYear() - new Date(admission.patient.dob).getFullYear()) : '--'}/${admission.patient.gender}
            
            Clinical Notes:
            ${admission.clinicalNotes.map(n => `- [${n.type}] ${n.note}`).join('\n')}
            
            Lab Records:
            ${admission.labRecords.map(l => `- ${l.testName}: ${l.result || 'Analyzed'}`).join('\n')}
            
            Surgeries:
            ${admission.surgeries.map(s => `- ${s.surgeryName} by ${s.surgeonName} on ${formatMedicalDate(s.surgeryDate, 'dd/MM/yyyy')}`).join('\n')}
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
