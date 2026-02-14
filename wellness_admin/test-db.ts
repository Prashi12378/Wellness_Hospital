
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking PharmacyInventory count...");
        const count = await prisma.pharmacyInventory.count();
        console.log("Total items:", count);

        if (count > 0) {
            const items = await prisma.pharmacyInventory.findMany({ take: 5 });
            console.log("First 5 items:", JSON.stringify(items, null, 2));
        } else {
            console.log("No items found in PharmacyInventory.");
        }
    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
