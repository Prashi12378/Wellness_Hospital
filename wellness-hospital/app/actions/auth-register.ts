'use server';

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export async function completeRegistration(formData: FormData) {
    try {
        const phone = formData.get('phone') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string; // Optional? User said details page
        const dob = formData.get('dob') as string;
        const gender = formData.get('gender') as string;

        if (!phone || !firstName || !lastName || !dob || !gender) {
            return { success: false, error: "Missing required fields" };
        }

        // Check if user exists (Double check)
        const existingProfile = await prisma.profile.findFirst({
            where: { phone }
        });

        if (existingProfile) {
            return { success: false, error: "User already exists" };
        }

        // Generate UHID
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const uhid = `WH-${dateStr}-${randomSuffix}`;
        const defaultPassword = "Password@123"; // Placeholder for Auth
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Deduce email if missing or ensure unique
        const userEmail = email || `${phone}@wellness.com`;

        // Check if a user with this email (or generated email) already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existingUser) {
            // If manual email, tell them it's taken.
            // If auto-generated email (via phone), it handles the edge case where User exists but Profile was missing/deleted?
            // Or they are trying to register with a phone that maps to an existing email.
            return { success: false, error: "This email address is already registered." };
        }

        // Create User & Profile
        await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: userEmail,
                password: hashedPassword,
                profile: {
                    create: {
                        email: userEmail,
                        phone,
                        firstName,
                        lastName,
                        dob,
                        gender,
                        uhid,
                        role: 'patient'
                    }
                }
            }
        });

        // Clear OTP so it can't be reused differently (optional, but good practice)
        // await prisma.otp.delete({ where: { phone } });

        return { success: true };

    } catch (error: any) {
        console.error("Registration failed:", error);
        return { success: false, error: error.message || "Registration failed" };
    }
}
