import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Reverting GST changes for previous bills...");

    // Find all invoices. We will revert invoices created before a certain cutoff.
    // Let's use the date/time just before we made the new changes, or rather all invoices 
    // EXCEPT the ones created in the last 15 minutes (since we just fixed it).
    // Or simpler: any invoice that already existed before this session.
    // Let's grab all invoices and check their created time.

    const dateCutoff = new Date(Date.now() - 30 * 60000); // 30 mins ago

    const invoicesToRevert = await prisma.invoice.findMany({
        where: {
            createdAt: {
                lt: dateCutoff
            }
        },
        include: {
            items: true
        }
    });

    let revertedCount = 0;

    for (const invoice of invoicesToRevert) {
        let invoiceSubTotal = 0;

        for (const item of invoice.items) {
            const qty = Number(item.qty);
            const mrp = Number(item.mrp);

            // Original amount calculation without GST
            const originalAmount = Number((qty * mrp).toFixed(2));
            invoiceSubTotal += originalAmount;

            // Revert item
            if (Number(item.gstRate) !== 0 || Number(item.amount) !== originalAmount) {
                await prisma.invoiceItem.update({
                    where: { id: item.id },
                    data: {
                        gstRate: 0,
                        amount: originalAmount
                    }
                });
            }
        }

        const discountAmount = Number(invoice.discountAmount || 0);
        const originalGrandTotal = Number((invoiceSubTotal - discountAmount).toFixed(2));

        // Revert invoice
        if (Number(invoice.totalGst) !== 0 || Number(invoice.grandTotal) !== originalGrandTotal || Number(invoice.subTotal) !== invoiceSubTotal) {
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    subTotal: invoiceSubTotal,
                    totalGst: 0,
                    grandTotal: originalGrandTotal
                }
            });
            console.log(`Reverted Invoice ${invoice.billNo}`);
            revertedCount++;
        }
    }

    console.log(`Finished reverting ${revertedCount} invoices.`);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    });
