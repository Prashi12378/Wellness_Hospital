'use server';

import { prisma } from "@/lib/db";
import { sendSMS } from "@/lib/sms";
import { randomInt } from "crypto";

export async function sendOtp(identifier: string, type: 'phone' | 'email' = 'phone') {
    try {
        if (!identifier) {
            return { success: false, error: "Identifier is required" };
        }

        // Generate 6-digit OTP
        const otp = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Save to DB (Upsert) based on type
        if (type === 'email') {
            await prisma.otp.upsert({
                where: { email: identifier } as any,
                update: {
                    code: otp,
                    expiresAt
                },
                create: {
                    email: identifier,
                    code: otp,
                    expiresAt
                } as any
            });

            // Send Email
            const { sendEmail } = await import("@/lib/email");
            const emailResult = await sendEmail(
                identifier,
                "Your Wellness Hospital Verification Code",
                `<div style="font-family: sans-serif; padding: 20px; text-align: center;">
                   <h2>Wellness Hospital</h2>
                   <p>Your verification code is:</p>
                   <h1 style="font-size: 32px; letter-spacing: 5px; color: #0284c7;">${otp}</h1>
                   <p>This code is valid for 10 minutes.</p>
                 </div>`
            );

            if (!emailResult.success) {
                console.error("Email Delivery Failed:", emailResult.error);
                return { success: false, error: "Failed to send Email OTP" };
            }

        } else {
            // PHONE OTP
            await prisma.otp.upsert({
                where: { phone: identifier },
                update: {
                    code: otp,
                    expiresAt
                },
                create: {
                    phone: identifier,
                    code: otp,
                    expiresAt
                }
            });

            // Send SMS
            console.log(`[DEV OTP] Sending OTP ${otp} to ${identifier}`);
            const smsResult = await sendSMS(identifier, `Your Wellness Hospital verification code is: ${otp}. Valid for 10 minutes.`);

            if (!smsResult.success) {
                console.error("SMS Delivery Failed:", smsResult.error);
                return { success: false, error: "Failed to send SMS." };
            }
        }

        return { success: true };

    } catch (error: any) {
        console.error("Failed to send OTP:", error);
        return { success: false, error: "Failed sending OTP" };
    }
}

export async function verifyOtp(identifier: string, code: string, type: 'phone' | 'email' = 'phone') {
    try {
        let record;

        if (type === 'email') {
            record = await prisma.otp.findUnique({ where: { email: identifier } as any });
        } else {
            record = await prisma.otp.findUnique({ where: { phone: identifier } });
        }

        if (!record) {
            return { success: false, error: "No OTP request found" };
        }

        if (record.code !== code) {
            return { success: false, error: "Invalid OTP" };
        }

        if (new Date() > record.expiresAt) {
            return { success: false, error: "OTP has expired" };
        }

        // OTP Valid. Check for user.
        let profile;
        if (type === 'email') {
            const user = await prisma.user.findUnique({
                where: { email: identifier } as any,
                include: { profile: true }
            });
            // If user exists, return profile (construct object to match existing return)
            if (user) {
                // Clean up OTP
                await prisma.otp.delete({ where: { email: identifier } as any });
                return {
                    success: true,
                    isNewUser: false,
                    user: { email: user.email, name: user.name }
                };
            }
        } else {
            profile = await prisma.profile.findFirst({
                where: { phone: identifier },
                include: { user: true }
            });

            if (profile && profile.user) {
                await prisma.otp.delete({ where: { phone: identifier } });
                return {
                    success: true,
                    isNewUser: false,
                    user: { email: profile.user.email, name: profile.user.name }
                };
            }
        }

        // New User
        return { success: true, isNewUser: true };

    } catch (error: any) {
        console.error("OTP Verification failed:", error);
        return { success: false, error: "Verification failed" };
    }
}
