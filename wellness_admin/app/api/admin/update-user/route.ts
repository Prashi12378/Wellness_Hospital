
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
            avatar_url
        } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // We update Profile primarily. If name changes, maybe User too?
        // Let's update both.

        const result = await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.update({
                where: { id: id }, // This ID is Profile ID from the frontend editing
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
                    // Note: cannot update email easily due to User relation consistency
                },
                include: { user: true }
            });

            if (profile.userId) {
                await tx.user.update({
                    where: { id: profile.userId },
                    data: {
                        name: fullName,
                        image: avatar_url
                    }
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
