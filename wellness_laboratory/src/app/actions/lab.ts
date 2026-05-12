"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/serialization";

export async function getLabRequests() {
    try {
        console.log("[LabActions] Fetching lab requests...");
        const requests = await prisma.labRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                patient: {
                    select: {
                        uhid: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        dob: true
                    }
                }
            }
        });
        console.log(`[LabActions] Found ${requests.length} requests.`);
        return { success: true, data: serializeData(requests) };
    } catch (error: any) {
        console.error("[LabActions] getLabRequests Error:", error);
        return { success: false, error: error.message };
    }
}

export async function searchPatients(query: string) {
    try {
        console.log(`[LabActions] Searching patients for query: "${query}"`);
        const patients = await prisma.profile.findMany({
            where: {
                role: 'patient',
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { uhid: { contains: query } },
                    { email: { contains: query } }
                ]
            },
            take: 5
        });
        console.log(`[LabActions] Search found ${patients.length} patients.`);
        return { success: true, data: patients };
    } catch (error: any) {
        console.error("[LabActions] searchPatients Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getLabRequestById(id: string) {
    try {
        const request = await prisma.labRequest.findUnique({
            where: { id },
            include: {
                patient: true
            }
        });
        return { success: true, data: serializeData(request) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePatientNameOnReport(id: string, patientName: string) {
    try {
        await prisma.labRequest.update({
            where: { id },
            data: { patientName }
        });
        revalidatePath(`/dashboard/report/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("[LabActions] updatePatientNameOnReport Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateDoctorNameOnReport(id: string, requestedByName: string) {
    try {
        await prisma.labRequest.update({
            where: { id },
            data: { requestedByName }
        });
        revalidatePath(`/dashboard/report/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("[LabActions] updateDoctorNameOnReport Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateLabRequestStatus(requestId: string, status: string, result?: string, reportUrl?: string, parameters?: any) {
    try {
        console.log(`[LabActions] Updating request ${requestId} to status ${status}`);
        
        // 1. Fetch current request to get patient info
        const currentRequest = await prisma.labRequest.findUnique({
            where: { id: requestId }
        });

        if (!currentRequest) {
            return { success: false, error: "Lab request not found" };
        }

        // 2. Update the LabRequest status
        await prisma.labRequest.update({
            where: { id: requestId },
            data: {
                status,
                result: result ?? undefined,
                reportUrl: reportUrl ?? undefined,
                parameters: (parameters?.parameters || parameters || null) as any,
                technicianName: (parameters as any)?.technicianName || undefined,
                consultantName: (parameters as any)?.consultantName || undefined,
                editUnlocked: status === 'completed' ? false : undefined,
                updatedAt: new Date()
            } as any
        });

        // 3. If completed, check for active IPD admission and sync to LabRecord
        if (status === 'completed') {
            const activeAdmission = await prisma.admission.findFirst({
                where: {
                    patientId: currentRequest.patientId,
                    status: 'admitted'
                }
            });

            if (activeAdmission) {
                console.log(`[LabActions] Syncing report to IPD admission: ${activeAdmission.id}`);
                
                // Check if a record already exists for this specific request
                // Since we don't have a requestId field in LabRecord yet, we match by admissionId and testName
                // as a best-effort, or we can just always create/update.
                const existingRecord = await prisma.labRecord.findFirst({
                    where: {
                        admissionId: activeAdmission.id,
                        testName: currentRequest.testName
                    }
                });

                if (existingRecord) {
                    await prisma.labRecord.update({
                        where: { id: existingRecord.id },
                        data: {
                            result: result || "Report Completed",
                            fileUrl: reportUrl || currentRequest.reportUrl || undefined,
                            recordedAt: new Date()
                        }
                    });
                } else {
                    await prisma.labRecord.create({
                        data: {
                            admissionId: activeAdmission.id,
                            testName: currentRequest.testName,
                            result: result || "Report Completed",
                            fileUrl: reportUrl || currentRequest.reportUrl || undefined,
                            recordedAt: new Date()
                        }
                    });
                }
            }
        }

        console.log(`[LabActions] Successfully updated request ${requestId}.`);
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/report/${requestId}`);
        return { success: true };
    } catch (error: any) {
        console.error("[LabActions] updateLabRequestStatus Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createLabRequest(data: {
    patientId: string;
    patientName: string;
    testName: string;
    department?: string;
    priority?: string;
    requestedById?: string;
    requestedByName?: string;
    technicianName?: string;
    consultantName?: string;
    amount?: number;
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const request = await tx.labRequest.create({
                data: {
                    patientId: data.patientId,
                    patientName: data.patientName,
                    testName: data.testName,
                    department: (data.department || "General") as any,
                    priority: data.priority || "normal",
                    requestedById: data.requestedById,
                    requestedByName: data.requestedByName,
                    technicianName: data.technicianName,
                    consultantName: data.consultantName,
                    amount: data.amount || 0,
                    status: "pending"
                }
            });

            if (data.amount && data.amount > 0) {
                // Find lab user ID or default to system
                const adminUser = await tx.user.findFirst({
                    where: { profile: { role: 'lab' } }
                });

                await tx.ledger.create({
                    data: {
                        transactionType: "income",
                        category: "lab",
                        description: `Lab Test: ${data.testName} for ${data.patientName}`,
                        amount: data.amount,
                        paymentMethod: "cash", // Or potentially map this if available
                        transactionDate: new Date(),
                        recordedBy: data.requestedById || adminUser?.id || "system",
                    }
                });
            }

            return request;
        });

        revalidatePath("/dashboard");
        return { success: true, data: serializeData(result) };
    } catch (error: any) {
        console.error("[LabActions] createLabRequest Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateUserProfile(userId: string, data: { name: string }) {
    try {
        console.log(`[LabActions] Updating user profile for ${userId}...`);
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name
            }
        });
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        console.error("[LabActions] updateUserProfile Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getUnbilledLabRequests(searchQuery?: string) {
    try {
        console.log(`[LabActions] Fetching unbilled requests with search: "${searchQuery || 'none'}"`);
        const requests = await prisma.labRequest.findMany({
            where: {
                isBilled: false,
                status: { in: ['processing', 'completed'] },
                OR: searchQuery ? [
                    { patientName: { contains: searchQuery, mode: 'insensitive' } },
                    { testName: { contains: searchQuery, mode: 'insensitive' } }
                ] : undefined
            },
            include: {
                patient: {
                    select: {
                        uhid: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        dob: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return { success: true, data: serializeData(requests) };
    } catch (error: any) {
        console.error("[LabActions] getUnbilledLabRequests Error:", error);
        return { success: false, error: error.message };
    }
}
