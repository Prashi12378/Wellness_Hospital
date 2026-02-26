
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
        const mappedDoctors = doctors.map(profile => {
            const firstName = profile.firstName || "";
            const lastName = profile.lastName || "";
            let fullName = [firstName, lastName].filter(Boolean).join(" ") || profile.user?.name || "Unknown";

            // Normalize "Dr." prefix (fix DR -> Dr, add dot/space if missing)
            fullName = fullName.replace(/^dr\.?\s*/i, 'Dr. ');

            return {
                ...profile,
                full_name: fullName,
                qualification: profile.qualifications,
                experience_years: profile.experience,
                consultation_fee: profile.consultationFee,
                available_timings: profile.availableTimings,
                avatar_url: profile.user?.image
            };
        });

        return NextResponse.json(mappedDoctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
