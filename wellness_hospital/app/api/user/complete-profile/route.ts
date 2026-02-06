import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { firstName, lastName, phone, dob, gender } = body;

        // Generate UHID if not exists
        // Format: WH-YYYY-RANDOM5
        const year = new Date().getFullYear();
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        const uhid = `WH-${year}-${randomDigits}`;

        // Create Profile
        const profile = await prisma.profile.create({
            data: {
                userId: session.user.id,
                email: session.user.email!,
                firstName,
                lastName,
                phone,
                // store dob/gender if you extended the schema or just ignore for now if not in schema
                // modifying User name
            }
        });

        // Update User name
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: `${firstName} ${lastName}`.trim() }
        });

        return NextResponse.json({ success: true, profile, uhid });

    } catch (error) {
        console.error("Complete Profile Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
