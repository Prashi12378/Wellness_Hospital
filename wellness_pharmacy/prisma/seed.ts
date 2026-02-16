
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Create a Verified Pharmacist
    const pharmacyEmail = 'wellnesshospital8383@gmail.com';
    const pharmacyPassword = await hash('Wellness_8383', 12);
    console.log(`Seeding pharmacist: ${pharmacyEmail}...`);

    const pharmacist = await prisma.user.upsert({
        where: { email: pharmacyEmail },
        update: {
            password: pharmacyPassword,
        },
        create: {
            email: pharmacyEmail,
            password: pharmacyPassword,
            name: 'Wellness Pharmacy',
            profile: {
                create: {
                    email: pharmacyEmail,
                    firstName: 'Wellness',
                    lastName: 'Pharmacy',
                    role: 'staff', // Using 'staff' role
                    phone: '8383838383'
                }
            }
        },
    });
    console.log(`Created pharmacist with id: ${pharmacist.id}`);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
