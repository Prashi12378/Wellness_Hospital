import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up orphan HospitalCharge records...');
    const res = await prisma.$executeRaw`DELETE FROM "HospitalCharge" WHERE "admissionId" IS NULL;`;
    console.log(`Deleted ${res} records`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
