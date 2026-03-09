import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const lastCreated = await prisma.invoice.findFirst({
        where: { billNo: { startsWith: 'S-' } },
        orderBy: { createdAt: 'desc' }
    });
    console.log("Invoice returned by findFirst:", lastCreated?.billNo, "createdAt:", lastCreated?.createdAt);

    if (lastCreated) {
        const lastNo = parseInt(lastCreated.billNo.split('-')[1]);
        const nextNo = `S-${lastNo + 1}`;
        console.log("Proposed nextBillNo:", nextNo);

        const exists = await prisma.invoice.findUnique({
            where: { billNo: nextNo }
        });
        console.log("Does proposed nextBillNo already exist?", !!exists);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
