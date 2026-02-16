"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLabRequests() {
    try {
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
        return { success: true, data: requests };
    } catch (error: any) {
        console.error("[LabActions] getLabRequests Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateLabRequestStatus(requestId: string, status: string, result?: string) {
    try {
        await prisma.labRequest.update({
            where: { id: requestId },
            data: {
                status,
                result: result || undefined,
                updatedAt: new Date()
            }
        });
        revalidatePath("/dashboard");
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
    priority?: string;
    requestedById?: string;
    requestedByName?: string;
}) {
    try {
        const request = await prisma.labRequest.create({
            data: {
                patientId: data.patientId,
                patientName: data.patientName,
                testName: data.testName,
                priority: data.priority || "normal",
                requestedById: data.requestedById,
                requestedByName: data.requestedByName,
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
