const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'pharmacist@wellness.com';
    const passwordsToTry = ['Wellness_8383', 'password123', 'admin123', 'staff123', 'Wellness_83832025'];

    console.log(`Checking password for ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !user.password) {
        console.log("User or password hash not found.");
        return;
    }

    for (const pw of passwordsToTry) {
        const isValid = await bcrypt.compare(pw, user.password);
        if (isValid) {
            console.log(`✅ FOUND! Password for ${email} is: ${pw}`);
            return;
        }
    }
    console.log("❌ None of the common passwords matched.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
