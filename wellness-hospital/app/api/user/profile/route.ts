import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Generate UHID if missing (for legacy users)
        if (!profile.uhid) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const newUhid = `WH-${dateStr}-${randomSuffix}`;

            await prisma.profile.update({
                where: { id: profile.id },
                data: { uhid: newUhid }
            });
            profile.uhid = newUhid;
        }

        // Return flattened structure to match what frontend expects
        return NextResponse.json({
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                dob: profile.dob || "",
                gender: profile.gender || "",
                email: profile.email,
                uhid: profile.uhid
            }
        });

    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { firstName, lastName, phone, dob, gender } = body;

        // Upsert profile (create if not exists, though it should exist for registered users)
        // If your User model has 'name', you should update that too
        const updatedProfile = await prisma.$transaction(async (tx) => {
            // 1. Update Profile Table
            const profile = await tx.profile.upsert({
                where: { userId: session.user.id },
                update: {
                    firstName,
                    lastName,
                    phone,
                    dob,
                    gender
                },
                create: {
                    userId: session.user.id,
                    email: session.user.email!,
                    firstName,
                    lastName,
                    phone,
                    dob,
                    gender
                }
            });

            // 2. Update User Table (name)
            await tx.user.update({
                where: { id: session.user.id },
                data: { name: `${firstName} ${lastName}`.trim() }
            });

            return profile;
        });

        return NextResponse.json({ success: true, profile: updatedProfile });

    } catch (error) {
        console.error("Profile PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
