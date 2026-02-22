const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'pharmacist@wellness.com';
    const newPassword = 'Wellness_8383';

    console.log(`Resetting password for ${email} to ${newPassword}...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword
        }
    });

    console.log(`Successfully updated password for: ${user.email}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
