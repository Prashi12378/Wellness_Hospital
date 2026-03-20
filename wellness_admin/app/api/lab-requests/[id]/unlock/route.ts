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
        const labRequest = await prisma.labRequest.update({
            where: { id: params.id },
            data: { editUnlocked },
        });

        return NextResponse.json(labRequest);
    } catch (error: any) {
        console.error("Error unlocking lab request:", error);
        return NextResponse.json(
            { error: "Failed to update lab request unlock status" },
            { status: 500 }
        );
    }
}
