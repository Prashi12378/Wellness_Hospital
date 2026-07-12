import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const trash = searchParams.get('trash') === 'true';

        if (trash) {
            const invoicesResult = await prisma.invoice.findMany({
                where: { isDeleted: true },
                orderBy: { createdAt: 'desc' }
            });

            const labRequests = await prisma.labRequest.findMany({
                where: {
                    isDeleted: true,
                    amount: { gt: 0 }
                },
                orderBy: { createdAt: 'desc' }
            });

            const admissions = await prisma.admission.findMany({
                where: { isDeleted: true },
                include: {
                    patient: true,
                    HospitalCharge: true
                }
            });

            const invoiceBills = invoicesResult.map((inv: any) => {
                let type = "OTHER";
                if (inv.billNo.startsWith("OPD-") || inv.billNo.startsWith("OBS-")) type = "OPD";
                else if (inv.billNo.startsWith("S-")) type = "PHARMACY";
                else if (inv.billNo.startsWith("INV-IPD-")) type = "IPD";
                else if (inv.billNo.startsWith("LAB/")) type = "LABORATORY";

                return {
                    id: inv.id,
                    billNo: inv.billNo,
                    date: inv.createdAt,
                    patientName: inv.patientName || "Unknown",
                    amount: Number(inv.grandTotal),
                    type: type,
                    status: inv.status,
                    paymentMethod: inv.paymentMethod,
                    editUnlocked: inv.editUnlocked,
                    isInvoice: true
                };
            });

            const labBills = labRequests.map((lab: any) => {
                return {
                    id: lab.id,
                    billNo: `LAB-${lab.id.slice(0, 6).toUpperCase()}`,
                    date: lab.createdAt,
                    patientName: lab.patientName || "Unknown",
                    amount: Number(lab.amount),
                    type: "LABORATORY",
                    status: lab.status.toUpperCase(),
                    paymentMethod: "CASH",
                    editUnlocked: lab.editUnlocked,
                    isInvoice: false
                };
            });

            const admissionBills = admissions.map((adm: any) => {
                const totalCharges = adm.HospitalCharge.reduce((sum: number, charge: any) => sum + Number(charge.amount), 0);
                return {
                    id: adm.id,
                    billNo: `IPD-${adm.id.slice(0, 6).toUpperCase()}`,
                    date: adm.admissionDate,
                    patientName: `${adm.patient.firstName} ${adm.patient.lastName}`,
                    amount: totalCharges,
                    type: "IPD",
                    status: "PENDING",
                    paymentMethod: "CASH",
                    editUnlocked: adm.editUnlocked,
                    isInvoice: false,
                    rawAdmission: adm
                };
            });

            const allBills = [...invoiceBills, ...labBills, ...admissionBills].sort((a, b) => b.date.getTime() - a.date.getTime());
            return NextResponse.json({ success: true, data: allBills });
        }

        const invoicesResult = await prisma.invoice.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' }
        });

        // Find lab requests that have costs associated, essentially generating a bill.
        const labRequests = await prisma.labRequest.findMany({
            where: {
                isDeleted: false,
                amount: { gt: 0 },
                isBilled: false
            },
            orderBy: { createdAt: 'desc' }
        });

        const admissions = await prisma.admission.findMany({
            where: {
                isDeleted: false,
                pharmacyInvoices: {
                    none: {
                        billNo: {
                            startsWith: "INV-IPD-"
                        }
                    }
                }
            },
            include: {
                patient: true,
                HospitalCharge: true
            }
        });

        const invoiceBills = invoicesResult.map((inv: any) => {
            let type = "OTHER";
            if (inv.billNo.startsWith("OPD-") || inv.billNo.startsWith("OBS-")) type = "OPD";
            else if (inv.billNo.startsWith("S-")) type = "PHARMACY";
            else if (inv.billNo.startsWith("INV-IPD-")) type = "IPD";
            else if (inv.billNo.startsWith("LAB/")) type = "LABORATORY";

            return {
                id: inv.id,
                billNo: inv.billNo,
                date: inv.createdAt,
                patientName: inv.patientName || "Unknown",
                amount: Number(inv.grandTotal),
                type: type,
                status: inv.status,
                paymentMethod: inv.paymentMethod,
                editUnlocked: inv.editUnlocked,
                isInvoice: true
            };
        });

        const labBills = labRequests.map((lab: any) => {
            return {
                id: lab.id,
                billNo: `LAB-${lab.id.slice(0, 6).toUpperCase()}`,
                date: lab.createdAt,
                patientName: lab.patientName || "Unknown",
                amount: Number(lab.amount),
                type: "LABORATORY",
                status: lab.status.toUpperCase(), // pending -> PENDING
                paymentMethod: "CASH", // default assumption for labs without dedicated invoice
                editUnlocked: lab.editUnlocked,
                isInvoice: false
            };
        });

        const admissionBills = admissions.map((adm: any) => {
            const totalCharges = adm.HospitalCharge.reduce((sum: number, charge: any) => sum + Number(charge.amount), 0);
            return {
                id: adm.id,
                billNo: `IPD-${adm.id.slice(0, 6).toUpperCase()}`,
                date: adm.admissionDate,
                patientName: `${adm.patient.firstName} ${adm.patient.lastName}`,
                amount: totalCharges,
                type: "IPD",
                status: "PENDING",
                paymentMethod: "CASH",
                editUnlocked: adm.editUnlocked,
                isInvoice: false,
                rawAdmission: adm // Pass this so we can show details in the modal
            };
        });

        // Combine and sort by date descending
        const allBills = [...invoiceBills, ...labBills, ...admissionBills].sort((a, b) => b.date.getTime() - a.date.getTime());

        return NextResponse.json({ success: true, data: allBills });

    } catch (error: any) {
        console.error("Fetch Bills Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch bills" }, { status: 500 });
    }
}
