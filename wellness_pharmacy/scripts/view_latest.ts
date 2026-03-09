import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        select: { billNo: true, createdAt: true, date: true },
        where: { billNo: { startsWith: 'S-' } },
        take: 10
    });

    console.log("Latest invoices by createdAt:");
    console.table(invoices);
}

main().catch(console.error).finally(() => prisma.$disconnect());
