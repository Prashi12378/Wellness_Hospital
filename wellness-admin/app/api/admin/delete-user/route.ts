
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Delete from Profile, user will be cascading deleted if configured, or we delete user?
        // Schema says: user User @relation(fields: [userId], references: [id], onDelete: Cascade) in Profile? NO
        // Profile says: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
        // This means if USER is deleted, Profile is deleted.
        // But we have Profile ID. We need to find the user ID.

        const profile = await prisma.profile.findUnique({
            where: { id }
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Delete User, which cascades to Profile
        await prisma.user.delete({
            where: { id: profile.userId }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ error: error.message || "Delete Failed" }, { status: 500 });
    }
}
