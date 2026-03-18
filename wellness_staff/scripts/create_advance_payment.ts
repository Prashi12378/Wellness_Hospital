import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking if Deposit table exists...");
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'Deposit';
    `);

    if (tables.length === 0) {
      console.log("Creating 'Deposit' table...");
      
      // 1. Create the table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "Deposit" (
            "id" TEXT NOT NULL,
            "patientId" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "description" TEXT,
            "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
            "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
            "invoiceId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
        );
      `);

      // 2. Add Unique Index
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "Deposit_invoiceId_key" ON "Deposit"("invoiceId");
      `);

      // 3. Add Foreign Keys
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Deposit" 
        ADD CONSTRAINT "Deposit_patientId_fkey" 
        FOREIGN KEY ("patientId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Deposit" 
        ADD CONSTRAINT "Deposit_invoiceId_fkey" 
        FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);

      console.log("'Deposit' table created successfully with foreign keys.");
    } else {
      console.log("'Deposit' table already exists.");
    }
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
