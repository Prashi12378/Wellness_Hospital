import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { editUnlocked } = await req.json();

        const params = await props.params;
        const admission = await prisma.admission.update({
            where: { id: params.id },
            data: { editUnlocked },
        });

        return NextResponse.json(admission);
    } catch (error: any) {
        console.error("Error unlocking admission:", error);
        return NextResponse.json(
            { error: "Failed to update admission unlock status" },
            { status: 500 }
        );
    }
}
