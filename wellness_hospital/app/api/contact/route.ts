import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, subject, message } = body;

        if (!firstName || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newMessage = await prisma.message.create({
            data: {
                firstName,
                lastName,
                email,
                subject,
                message
            }
        });

        return NextResponse.json({ success: true, id: newMessage.id });

    } catch (error) {
        console.error("Contact Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
