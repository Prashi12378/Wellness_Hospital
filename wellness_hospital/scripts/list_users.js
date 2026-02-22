const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            profile: {
                select: { role: true }
            }
        }
    });

    console.log("\n=== ALL USERS ===");
    users.forEach(u => {
        console.log(`Username: ${u.username || 'NULL'} | Email: ${u.email} | Name: ${u.name} | Role: ${u.profile?.role || 'N/A'}`);
    });
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
