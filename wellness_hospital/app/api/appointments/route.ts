import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        console.log("Starting Appointments Fetch");
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            console.log("Unauthorized: No session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log("Session retrieved for user:", session.user.id);

        // Add timeout to prevent hanging
        console.time("db_query");
        const queryPromise = prisma.appointment.findMany({
            where: {
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

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
        );

        let appointments;
        try {
            appointments = await Promise.race([queryPromise, timeoutPromise]);
            console.timeEnd("db_query");
            console.log("DB Query Completed, found:", appointments.length);
        } catch (error) {
            console.error("DB Query failed or timed out:", error);
            console.timeEnd("db_query");
            // Return empty array on timeout instead of 500 error
            return NextResponse.json([]);
        }

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
