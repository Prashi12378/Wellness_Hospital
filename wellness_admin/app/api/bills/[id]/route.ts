import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const isInvoice = searchParams.get('isInvoice') === 'true';

        if (isInvoice) {
            await prisma.invoice.delete({
                where: { id }
            });
        } else if (type === 'LABORATORY') {
            await prisma.labRequest.delete({
                where: { id }
            });
        } else if (type === 'IPD') {
             await prisma.admission.delete({
                 where: { id }
             });
        } else {
             return NextResponse.json({ error: "Invalid bill type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Bill Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete bill" }, { status: 500 });
    }
}
