"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/serialization";

export async function createLabInvoice(data: any) {
    try {
        // Generate a unique Bill Number
        const currentYear = new Date().getFullYear();
        const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
        const lastInvoice = await prisma.invoice.findFirst({
            where: { billNo: { startsWith: `LAB/${datePrefix}` } },
            orderBy: { billNo: "desc" },
        });

        let sequence = 1;
        if (lastInvoice && lastInvoice.billNo) {
            const parts = lastInvoice.billNo.split("-");
            if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
                sequence = parseInt(parts[1]) + 1;
            }
        }

        const billNo = `LAB/${datePrefix}-${sequence.toString().padStart(4, "0")}`;

        const invoice = await prisma.invoice.create({
            data: {
                billNo,
                patientName: data.patientName,
                patientPhone: data.patientPhone || null,
                doctorName: data.doctorName || "Self-Referred",
                subTotal: data.subTotal,
                totalGst: data.totalGst,
                discountAmount: data.discountAmount || 0,
                discountRate: data.discountRate || 0,
                grandTotal: data.grandTotal,
                paymentMethod: data.paymentMethod,
                status: data.paymentMethod === "CREDIT" ? "PENDING" : "PAID",
                items: {
                    create: data.items.map((item: any) => ({
                        medicineId: "LAB_TEST",
                        name: item.name,
                        qty: 1, // Usually 1 test of a kind
                        mrp: item.price,
                        gstRate: item.gstRate || 0,
                        amount: item.amount,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // Also record it in the Ledger if paid immediately
        if (invoice.status === "PAID") {
            const systemUser = await prisma.user.findFirst({ where: { profile: { role: 'admin' } } }); // Or get current user session
            if (systemUser) {
                await prisma.ledger.create({
                    data: {
                        transactionType: "INCOME",
                        category: "Lab Billing",
                        description: `Invoice ${billNo} - ${data.patientName}`,
                        amount: data.grandTotal,
                        paymentMethod: data.paymentMethod,
                        transactionDate: new Date(),
                        recordedBy: systemUser.id,
                    }
                });
            }
        }

        revalidatePath("/dashboard/billing");
        return { success: true, invoice: serializeData(invoice) };
    } catch (error: any) {
        console.error("Error creating lab invoice:", error);
        return { success: false, error: error.message || "Failed to create invoice" };
    }
}
