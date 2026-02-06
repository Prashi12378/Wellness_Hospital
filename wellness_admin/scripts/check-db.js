const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Checking Database Connection...');

    // Set a timeout for the connection
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: ['error']
    });

    try {
        const start = Date.now();
        // Try a simple query
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;

        console.log('\x1b[32m%s\x1b[0m', `✅ Database Connected Successfully! (${duration}ms)`);
        console.log('You are good to go.');
        process.exit(0);

    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '❌ Database Connection Failed!');

        if (error.code === 'P1001') {
            console.log('\n\x1b[33m%s\x1b[0m', 'Possible Cause: IP Not Whitelisted');
            console.log('AWS RDS is blocking the connection. Your public IP may have changed.');
            console.log('Action: Update AWS Security Group inbound rules for port 5432.');
        } else {
            console.error('\nError Details:', error.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
