'use server';

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerPatient(formData: FormData) {
    try {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const dob = formData.get('dob') as string;
        const gender = formData.get('gender') as string;

        // Basic Validation
        if (!firstName || !lastName || !email || !phone || !dob || !gender) {
            return { success: false, error: "All fields are required" };
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: "A patient with this email already exists." };
        }

        // Limit: Max 3 patients per phone number
        const phoneCount = await prisma.profile.count({
            where: { phone, role: 'patient' }
        });

        if (phoneCount >= 3) {
            return { success: false, error: "Maximum registration limit (3) reached for this phone number." };
        }

        // Generate Unique UHID (WH-YYYYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `WH-${dateStr}-`;

        // Find the latest UHID for today to determine the next sequential number
        const lastProfile = await prisma.profile.findFirst({
            where: {
                uhid: {
                    startsWith: prefix
                }
            },
            orderBy: {
                uhid: 'desc'
            },
            select: {
                uhid: true
            }
        });

        let nextCounter = 1;
        if (lastProfile?.uhid) {
            const lastCounterPart = lastProfile.uhid.split('-').pop();
            if (lastCounterPart) {
                const lastCount = parseInt(lastCounterPart, 10);
                if (!isNaN(lastCount)) {
                    nextCounter = lastCount + 1;
                }
            }
        }

        const uhid = `${prefix}${nextCounter.toString().padStart(4, '0')}`;
        const defaultPassword = "Password@123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Transaction to create User and Profile
        const user = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        email,
                        firstName,
                        lastName,
                        phone,
                        role: 'patient',
                        uhid,
                        dob,
                        gender
                    }
                }
            }
        });

        revalidatePath('/dashboard/patients');
        return { success: true, user };

    } catch (error) {
        console.error("Registration failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to register patient";
        return { success: false, error: errorMessage };
    }
}
