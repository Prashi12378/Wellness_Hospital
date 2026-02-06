'use server';

import { prisma } from "@/lib/db";
import { sendSMS } from "@/lib/sms";
import { randomInt } from "crypto";

export async function sendOtp(phone: string) {
    try {
        if (!phone) {
            return { success: false, error: "Phone number is required" };
        }

        // Generate 6-digit OTP
        const otp = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Save to DB (Upsert)
        await prisma.otp.upsert({
            where: { phone },
            update: {
                code: otp,
                expiresAt
            },
            create: {
                phone,
                code: otp,
                expiresAt
            }
        });

        // Send SMS
        // For testing/cost saving, log it. But user asked for real AWS.
        // I will log it too just in case AWS quota is hit.
        console.log(`[DEV OTP] Sending OTP ${otp} to ${phone}`);

        const smsResult = await sendSMS(phone, `Your Wellness Hospital verification code is: ${otp}. Valid for 10 minutes.`);

        if (!smsResult.success) {
            console.error("SMS Delivery Failed:", smsResult.error);
            // Optional: return specific error if dev mode or relevant
            return { success: false, error: "Failed to send SMS. Please contact support or check server logs." };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Failed to send OTP:", error);
        return { success: false, error: "Failed an sending OTP" };
    }
}

export async function verifyOtp(phone: string, code: string) {
    try {
        const record = await prisma.otp.findUnique({
            where: { phone }
        });

        if (!record) {
            return { success: false, error: "No OTP found for this number" };
        }

        if (record.code !== code) {
            return { success: false, error: "Invalid OTP" };
        }

        if (new Date() > record.expiresAt) {
            return { success: false, error: "OTP has expired" };
        }

        // Valid OTP. Now check if user exists.
        // We check Profile because that's where 'phone' often lives in our new schema, 
        // BUT Otp uses 'phone' as key. 
        // Wait, User has email (optional unique), Profile has phone.
        // Let's check Profile first.

        const profile = await prisma.profile.findFirst({
            where: { phone },
            include: { user: true }
        });

        if (profile && profile.user) {
            // User exists!
            // Clean up OTP
            await prisma.otp.delete({ where: { phone } });
            return {
                success: true,
                isNewUser: false,
                user: { email: profile.user.email, name: profile.user.name }
            };
        } else {
            // New User
            return { success: true, isNewUser: true };
        }

    } catch (error: any) {
        console.error("OTP Verification failed:", error);
        return { success: false, error: "Verification failed" };
    }
}
