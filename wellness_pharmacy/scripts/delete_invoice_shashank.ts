import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Looking for recent bills belonging to patient: shashank");

    // Get the most recent invoices matching the name
    const recentInvoices = await prisma.invoice.findMany({
        where: {
            patientName: {
                contains: "shashank",
                mode: "insensitive"
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            items: true
        }
    });

    if (recentInvoices.length === 0) {
        console.log("No invoices found for patient 'shashank'.");
        return;
    }

    // We'll operate on the most recent one (assuming user just made it)
    const invoiceToDelete = recentInvoices[0];

    console.log(`Found Invoice ${invoiceToDelete.billNo} for patient ${invoiceToDelete.patientName}.`);
    console.log("Reversing stock deductions...");

    // Start a transaction to restore inventory and delete the invoice & its ledger entry
    await prisma.$transaction(async (tx) => {
        // 1. Restore Stock Inventory
        for (const item of invoiceToDelete.items) {
            await tx.pharmacyInventory.update({
                where: { id: item.medicineId },
                data: {
                    stock: {
                        increment: Number(item.qty)
                    }
                }
            });
            console.log(`Restored ${item.qty} units to stock for medicine: ${item.name}`);
        }

        // 2. Find and delete the corresponding ledger entry 
        // Typically described as: `Pharmacy Sale - Bill #${billNo} ...`
        const ledgerMatches = await tx.ledger.findMany({
            where: {
                category: 'pharmacy',
                description: {
                    contains: invoiceToDelete.billNo
                }
            }
        });

        for (const ledger of ledgerMatches) {
            await tx.ledger.delete({ where: { id: ledger.id } });
            console.log(`Deleted associated Ledger entry: ${ledger.description}`);
        }

        // 3. Delete the invoice itself (Cascade will delete InvoiceItems automatically)
        await tx.invoice.delete({
            where: { id: invoiceToDelete.id }
        });

        console.log(`Successfully deleted Invoice ${invoiceToDelete.billNo}.`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
