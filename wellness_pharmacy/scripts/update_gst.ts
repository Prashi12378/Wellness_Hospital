import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting GST update for previous bills...");

    // Get all invoices with their items
    const invoices = await prisma.invoice.findMany({
        include: {
            items: true
        }
    });

    let updatedCount = 0;

    for (const invoice of invoices) {
        let invoiceTotalGst = 0;
        let invoiceSubTotal = 0;

        for (const item of invoice.items) {
            // Find the inventory item to get the correct GST rate
            const inventoryItem = await prisma.pharmacyInventory.findUnique({
                where: { id: item.medicineId }
            });

            // Default to 5% if item not found, just to apply some GST, or stick to 0.
            // Using 5% as it was the fallback in the system. Let's use the actual gstRate from inventory if available
            const gstRate = inventoryItem ? Number(inventoryItem.gstRate) : 5;

            // Calculate GST for this item
            const qty = Number(item.qty);
            const mrp = Number(item.mrp);
            // Re-calculate amount just in case
            const amount = Number((qty * mrp).toFixed(2));
            const itemGst = Number(((amount * gstRate) / 100).toFixed(2));

            invoiceSubTotal += amount;
            invoiceTotalGst += itemGst;

            // Update the invoice item
            if (Number(item.gstRate) !== gstRate || Number(item.amount) !== amount) {
                await prisma.invoiceItem.update({
                    where: { id: item.id },
                    data: {
                        gstRate: gstRate,
                        amount: amount
                    }
                });
            }
        }

        const discountAmount = Number(invoice.discountAmount || 0);
        // Recalculate grand total
        const calculatedGrandTotal = Number((invoiceSubTotal + invoiceTotalGst - discountAmount).toFixed(2));

        // Update the invoice totals
        if (Number(invoice.totalGst) !== invoiceTotalGst || Number(invoice.grandTotal) !== calculatedGrandTotal || Number(invoice.subTotal) !== invoiceSubTotal) {
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    subTotal: invoiceSubTotal,
                    totalGst: invoiceTotalGst,
                    grandTotal: calculatedGrandTotal
                }
            });
            console.log(`Updated Invoice ${invoice.billNo}: SubTotal = ${invoiceSubTotal}, Total GST = ${invoiceTotalGst}, Grand Total = ${calculatedGrandTotal}`);
            updatedCount++;
        }
    }

    console.log(`Finished updating ${updatedCount} invoices.`);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    });
