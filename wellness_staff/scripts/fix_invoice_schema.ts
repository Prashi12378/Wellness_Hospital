import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking if 'ward' column exists in 'Invoice' table...");
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Invoice';
    `);

    const hasWard = columns.some((col: any) => col.column_name === 'ward');

    if (!hasWard) {
      console.log("Adding 'ward' column to 'Invoice' table...");
      await prisma.$executeRawUnsafe(`ALTER TABLE "Invoice" ADD COLUMN "ward" TEXT;`);
      console.log("'ward' column added successfully.");
    } else {
      console.log("'ward' column already exists.");
    }
  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
