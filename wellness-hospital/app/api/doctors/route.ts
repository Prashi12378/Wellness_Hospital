import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        let doctors;

        if (id) {
            const doctor = await prisma.profile.findUnique({
                where: { id },
                include: { user: true }
            });

            if (!doctor || doctor.role !== 'doctor') { // Ensure it's a doctor
                return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
            }
            doctors = [doctor];
        } else {
            doctors = await prisma.profile.findMany({
                where: { role: 'doctor' },
                include: { user: true },
                orderBy: { firstName: 'asc' }
            });
        }

        const formattedWithUser = doctors.map(d => ({
            id: d.id,
            full_name: `${d.firstName} ${d.lastName}`.trim(),
            specialization: d.specialization,
            qualification: d.qualifications,
            experience_years: d.experience,
            consultation_fee: d.consultationFee,
            bio: d.bio,
            available_timings: d.availableTimings,
            avatar_url: d.user?.image,
            email: d.email
        }));

        if (id) {
            return NextResponse.json(formattedWithUser[0]);
        }

        return NextResponse.json(formattedWithUser);

    } catch (error) {
        console.error("Doctors Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
