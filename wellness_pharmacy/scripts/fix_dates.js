const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const futureInvoices = await prisma.invoice.findMany({
        where: {
            createdAt: {
                gt: new Date()
            }
        }
    });

    console.log(`Found ${futureInvoices.length} invoices with future createdAt. Fixing...`);

    if (futureInvoices.length > 0) {
        await prisma.invoice.updateMany({
            where: { createdAt: { gt: new Date() } },
            data: { createdAt: new Date() }
        });
        console.log('Fixed future dates.');
    }

    // Also check if any other invoices are out of sequence and fix them.
    // We can just find the max billNo's suffix and make an empty record with that createdAt
    // or really just find the latest created invoice by actual billNo.

    const allInvoices = await prisma.invoice.findMany({
        where: { billNo: { startsWith: 'S-' } }
    });

    let maxSuffix = 10000;
    let latestInvoice = null;
    for (const inv of allInvoices) {
        const parts = inv.billNo.split('-');
        if (parts.length > 1) {
            const suffix = parseInt(parts[1], 10);
            if (!isNaN(suffix) && suffix > maxSuffix) {
                maxSuffix = suffix;
                latestInvoice = inv;
            }
        }
    }

    console.log('Max billNo suffix found:', maxSuffix);

    // To ensure `lastInvoice` grabs the HIGHEST billNo, we must ensure its `createdAt` is the latest.
    if (latestInvoice) {
        // Find the absolute maximum createdAt among all S- invoices
        let maxCreatedAt = latestInvoice.createdAt;
        for (const inv of allInvoices) {
            if (inv.createdAt > maxCreatedAt) {
                maxCreatedAt = inv.createdAt;
            }
        }

        // Add 1 second to the absolute maxCreatedAt
        const newMaxDate = new Date(maxCreatedAt.getTime() + 1000);

        console.log(`Setting highest billNo (${latestInvoice.billNo}) createdAt to ${newMaxDate}`);

        await prisma.invoice.update({
            where: { id: latestInvoice.id },
            data: { createdAt: newMaxDate }
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
