const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to access pharmacySettings...');
        const settings = await prisma.pharmacySettings.findUnique({
            where: { id: 'default' }
        });
        console.log('Success! Settings found or null:', settings);
    } catch (error) {
        console.error('Error accessing pharmacySettings:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
