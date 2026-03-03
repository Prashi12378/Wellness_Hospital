'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deletePatient(patientId: string) {
    try {
        const patient = await prisma.profile.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            return { success: false, error: "Patient not found" };
        }

        // Delete the user, which should cascade and delete the profile
        if (patient.userId) {
            await prisma.user.delete({
                where: { id: patient.userId }
            });
        } else {
            await prisma.profile.delete({
                where: { id: patient.id }
            });
        }

        revalidatePath('/dashboard/patients');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete patient:", error);
        return { success: false, error: "Failed to delete patient" };
    }
}

export async function updatePatient(patientId: string, formData: FormData) {
    try {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const phone = formData.get('phone') as string;
        const dob = formData.get('dob') as string;
        const gender = formData.get('gender') as string;

        if (!firstName || !lastName || !phone || !dob || !gender) {
            return { success: false, error: "All fields are required" };
        }

        const profile = await prisma.profile.update({
            where: { id: patientId },
            data: {
                firstName,
                lastName,
                phone,
                dob,
                gender
            }
        });

        // also update the associated User record name
        if (profile.userId) {
            await prisma.user.update({
                where: { id: profile.userId },
                data: {
                    name: `${firstName} ${lastName}`
                }
            });
        }

        revalidatePath(`/dashboard/patients`);
        revalidatePath(`/dashboard/patients/${patientId}`);
        revalidatePath(`/dashboard/patients/${patientId}/edit`);

        return { success: true, profile };
    } catch (error) {
        console.error("Failed to update patient:", error);
        return { success: false, error: "Failed to update patient" };
    }
}
