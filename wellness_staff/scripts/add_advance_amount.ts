import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking if 'depositAmount' column exists in 'Invoice' table...");
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Invoice';
    `);

    const hasAdvanceAmount = columns.some((col: any) => col.column_name === 'depositAmount');

    if (!hasAdvanceAmount) {
      console.log("Adding 'depositAmount' column to 'Invoice' table...");
      await prisma.$executeRawUnsafe(`ALTER TABLE "Invoice" ADD COLUMN "depositAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;`);
      console.log("'depositAmount' column added successfully.");
    } else {
      console.log("'depositAmount' column already exists.");
    }
  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
