"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
        return { success: true, data: requests };
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
        return { success: true, data: request };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLabRequestStatus(requestId: string, status: string, result?: string, reportUrl?: string, parameters?: any) {
    try {
        console.log(`[LabActions] Updating request ${requestId} to status ${status}`);
        await prisma.labRequest.update({
            where: { id: requestId },
            data: {
                status,
                result: result ?? undefined,
                reportUrl: reportUrl ?? undefined,
                parameters: (parameters?.parameters || parameters || null) as any,
                technicianName: (parameters as any)?.technicianName || undefined,
                consultantName: (parameters as any)?.consultantName || undefined,
                updatedAt: new Date()
            } as any
        });
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
}) {
    try {
        const request = await prisma.labRequest.create({
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
                status: "pending"
            }
        });
        revalidatePath("/dashboard");
        return { success: true, data: request };
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
