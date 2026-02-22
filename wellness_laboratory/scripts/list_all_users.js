const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Listing all users and their roles...");
    const users = await prisma.user.findMany({
        include: {
            profile: true
        }
    });

    users.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.profile?.role || "No Profile/Role"}`);
        console.log("-------------------");
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
