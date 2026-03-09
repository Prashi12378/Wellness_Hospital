import { PrismaClient } from '@prisma/client';
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

    // Find latest S- invoice and ensure it has the highest createdAt
    const allInvoices = await prisma.invoice.findMany({
        where: { billNo: { startsWith: 'S-' } }
    });

    let maxSuffix = 0;
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

    if (latestInvoice) {
        let maxCreatedAt = latestInvoice.createdAt;
        for (const inv of allInvoices) {
            if (inv.createdAt > maxCreatedAt) {
                maxCreatedAt = inv.createdAt;
            }
        }

        const newMaxDate = new Date(maxCreatedAt.getTime() + 1000); // 1 second into future from max

        // But only if latestInvoice does not ALREADY have the max createdAt
        if (latestInvoice.createdAt.getTime() < maxCreatedAt.getTime()) {
            console.log(`Setting highest billNo (${latestInvoice.billNo}) createdAt to ${newMaxDate}`);

            await prisma.invoice.update({
                where: { id: latestInvoice.id },
                data: { createdAt: newMaxDate }
            });
        } else {
            console.log(`Highest billNo (${latestInvoice.billNo}) already has the highest createdAt.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
