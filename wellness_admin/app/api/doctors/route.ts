
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctors = await prisma.profile.findMany({
            where: {
                role: 'doctor'
            },
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map Prisma camelCase fields to snake_case fields expected by frontend
        const mappedDoctors = doctors.map(doctor => ({
            ...doctor,
            full_name: doctor.firstName && doctor.lastName
                ? `${doctor.firstName} ${doctor.lastName}`
                : doctor.firstName || doctor.lastName || doctor.user?.name || 'Unknown',
            qualification: doctor.qualifications,
            experience_years: doctor.experience,
            consultation_fee: doctor.consultationFee,
            available_timings: doctor.availableTimings,
            avatar_url: doctor.user?.image
        }));

        return NextResponse.json(mappedDoctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
