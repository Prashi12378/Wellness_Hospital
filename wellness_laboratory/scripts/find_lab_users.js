const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for users with 'lab' or 'laboratory' role...");
    const users = await prisma.user.findMany({
        include: {
            profile: true
        }
    });

    const labUsers = users.filter(user => {
        const role = user.profile?.role?.toLowerCase();
        return role === 'lab' || role === 'laboratory';
    });

    if (labUsers.length === 0) {
        console.log("No lab users found.");
    } else {
        labUsers.forEach(user => {
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.profile.role}`);
            console.log(`Name: ${user.name}`);
            console.log("-------------------");
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
