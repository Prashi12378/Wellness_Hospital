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

        // Generate UHID (WH-YYYYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const uhid = `WH-${dateStr}-${randomSuffix}`;
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

    } catch (error: any) {
        console.error("Registration failed:", error);
        return { success: false, error: error.message || "Failed to register patient" };
    }
}
