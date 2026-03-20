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
        const { id } = params;

        // Try updating as an invoice first
        try {
            const invoice = await prisma.invoice.update({
                where: { id },
                data: { editUnlocked },
            });

            // If it's linked to an admission, unlock the admission too
            if (invoice.admissionId) {
                await prisma.admission.update({
                    where: { id: invoice.admissionId },
                    data: { editUnlocked },
                });
            }
            return NextResponse.json(invoice);
        } catch (e) {
            // If invoice update fails, try updating as an admission (for IPD bills without invoices)
            try {
                const admission = await prisma.admission.update({
                    where: { id },
                    data: { editUnlocked },
                });
                return NextResponse.json(admission);
            } catch (err) {
                throw new Error("Record not found in Invoice or Admission tables");
            }
        }
    } catch (error: any) {
        console.error("Error unlocking invoice:", error);
        return NextResponse.json(
            { error: "Failed to update invoice unlock status" },
            { status: 500 }
        );
    }
}
