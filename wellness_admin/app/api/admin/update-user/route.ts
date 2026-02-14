
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            id,
            fullName,
            phone,
            specialization,
            qualification,
            experience,
            fee,
            timings,
            bio,
            avatar_url,
            password,
            email
        } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.update({
                where: { id: id },
                data: {
                    firstName: fullName.split(' ')[0],
                    lastName: fullName.split(' ').slice(1).join(' '),
                    phone,
                    specialization,
                    qualifications: qualification,
                    experience: experience ? parseInt(experience) : undefined,
                    consultationFee: fee ? parseFloat(fee) : undefined,
                    availableTimings: timings,
                    bio,
                },
                include: { user: true }
            });

            if (profile.userId) {
                const userData: any = {
                    name: fullName,
                    image: avatar_url
                };

                if (password) {
                    userData.password = await bcrypt.hash(password, 10);
                }

                await tx.user.update({
                    where: { id: profile.userId },
                    data: userData
                });
            }

            return profile;
        });

        return NextResponse.json({ success: true, profile: result });

    } catch (error: any) {
        console.error("Update User Error:", error);
        return NextResponse.json({ error: error.message || "Update Failed" }, { status: 500 });
    }
}
