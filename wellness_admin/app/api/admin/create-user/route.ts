
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) { // Add role check if needed
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            email,
            password,
            fullName,
            role,
            phone,
            specialization,
            qualification,
            experience,
            fee,
            timings,
            bio,
            avatar_url,
            username
        } = body;

        if (!email || !password || !fullName || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Check if username is already taken
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username }
            });
            if (existingUsername) {
                return NextResponse.json({ error: "Username already taken" }, { status: 409 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to create User and Profile
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    username: username || undefined,
                    password: hashedPassword,
                    name: fullName,
                    image: avatar_url
                }
            });

            // Map role string to enum
            const roleEnum = (["admin", "doctor", "staff", "patient"].includes(role)) ? role : "patient";

            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    email,
                    firstName: fullName.split(' ')[0],
                    lastName: fullName.split(' ').slice(1).join(' '), // Approximate split
                    role: roleEnum,
                    phone,
                    specialization,
                    qualifications: qualification,
                    experience: experience ? parseInt(experience) : undefined,
                    consultationFee: fee ? parseFloat(fee) : undefined,
                    availableTimings: timings, // JSON
                    bio,
                }
            });

            return { user, profile };
        });

        return NextResponse.json({ success: true, user: result.user });

    } catch (error: any) {
        console.error("Create User Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
