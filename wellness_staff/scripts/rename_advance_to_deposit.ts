import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Renaming 'Deposit' to 'Deposit' and related columns...");

    // 1. Rename Deposit table to Deposit
    // First check if Deposit exists to avoid error
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'Deposit';
    `);

    if (tables.length === 0) {
      console.log("Renaming table 'Deposit' to 'Deposit'...");
      await prisma.$executeRawUnsafe(`ALTER TABLE "Deposit" RENAME TO "Deposit";`);
    } else {
      console.log("Table 'Deposit' already exists.");
    }

    // 2. Rename columns in Invoice table
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Invoice';
    `);

    const hasAdvanceAmount = columns.some((col: any) => col.column_name === 'depositAmount');
    if (hasAdvanceAmount) {
      console.log("Renaming 'Invoice.depositAmount' to 'depositAmount'...");
      await prisma.$executeRawUnsafe(`ALTER TABLE "Invoice" RENAME COLUMN "depositAmount" TO "depositAmount";`);
    }

    const hasDepositId = columns.some((col: any) => col.column_name === 'invoiceId'); // No, it was unique in Deposit
    // Wait, let's look at the schema again.
    // In Deposit: invoiceId String? @unique
    // In Invoice: deposit Deposit? @relation("InvoiceDeposit")
    
    // In my previous addition it was:
    // nextBillNo = `S-${lastNo + 1}`;
    // ...
    // depositAmount: data.depositAmount || 0,
    // ...
    // if (data.depositId) {
    //   await tx.deposit.update({ where: { id: data.depositId }, data: { status: 'CONSUMED', invoiceId: newInvoice.id } });
    // }

    // So Invoice DOES NOT HAVE depositId as a column, it's the other way around or Prisma handles it.
    // Let's check the schema again for Invoice.
    
    /*
    model Invoice {
      ...
      depositAmount  Decimal         @default(0)
      deposit Deposit? @relation("InvoiceDeposit")
    }
    model Deposit {
      ...
      invoiceId     String?  @unique
      invoice       Invoice? @relation("InvoiceDeposit", fields: [invoiceId], references: [id])
    }
    */
    
    // So Invoice only has depositAmount.
    
    console.log("Renaming columns in 'Deposit' (formerly Deposit) table...");
    // No columns in Deposit need renaming based on my previous schema, 
    // but I'll check for consistency.
    
    console.log("Database renaming complete.");

  } catch (error) {
    console.error("Error during renaming:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
