import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const inv = await prisma.invoice.findUnique({
        where: { billNo: 'S-11048' }
    });
    console.log("Invoice S-11048:", inv);

    if (inv) {
        console.log("Found it! Why didn't it show up in orderBy createdAt?");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
