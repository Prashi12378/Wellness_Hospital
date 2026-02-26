
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.profile.findMany({
        where: { role: 'doctor' },
        include: { user: true }
    });

    console.log(JSON.stringify(profiles, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
