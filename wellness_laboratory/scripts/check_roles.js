const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = ['admin', 'lab', 'doctor', 'staff'];

    for (const role of roles) {
        console.log(`Checking role: ${role}`);
        const users = await prisma.user.findMany({
            where: {
                profile: {
                    role: role
                }
            }
        });

        if (users.length === 0) {
            console.log(`No users found with role: ${role}`);
        } else {
            users.forEach(u => console.log(` - ${u.email} (${u.name})`));
        }
        console.log("-------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
