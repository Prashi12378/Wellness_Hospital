import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                // If user is patient, fetch their appointments
                // If doctor? The portal seems to be for patients.
                // We'll rely on session.user.id mapping to Profile.userId or similar.
                // Schema has patientId as String (Profile ID) not User ID?
                // Let's check relation. Appointment.patient -> Profile.
                // We need to resolve Profile ID from session User ID.
                patient: {
                    userId: session.user.id
                }
            },
            include: {
                doctor: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                appointmentDate: 'desc'
            }
        });

        // Map to frontend expectation
        const formatted = appointments.map(a => ({
            id: a.id,
            doctor_name: a.doctor ? `${a.doctor.firstName} ${a.doctor.lastName}` : 'Unknown Doctor',
            department: a.department,
            date: a.appointmentDate.toISOString().split('T')[0],
            time: a.appointmentTime,
            status: a.status,
            type: a.type
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Appointments Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            doctor_id,
            department,
            appointment_date,
            appointment_time,
            patient_name,
            patient_phone,
            patient_email,
            reason
        } = body;

        // Verify profile exists for user
        let profile = await prisma.profile.findUnique({
            where: { userId: session.user.id }
        });

        // If no profile, maybe create one? Or error? 
        // For booking, we usually expect a profile. 
        // If we are just booking for self as authenticated user:
        if (!profile) {
            // Attempt to create basic profile or fail
            profile = await prisma.profile.create({
                data: {
                    userId: session.user.id,
                    email: session.user.email!,
                    firstName: patient_name?.split(' ')[0] || 'User',
                    lastName: patient_name?.split(' ').slice(1).join(' ') || '',
                    phone: patient_phone
                }
            });
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                patientId: profile.id,
                doctorId: doctor_id,
                department,
                appointmentDate: new Date(appointment_date),
                appointmentTime: appointment_time,
                patientName: patient_name,
                patientPhone: patient_phone,
                patientEmail: patient_email,
                reason,
                status: 'scheduled'
            }
        });

        return NextResponse.json({ success: true, id: newAppointment.id });

    } catch (error) {
        console.error("Appointment Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
