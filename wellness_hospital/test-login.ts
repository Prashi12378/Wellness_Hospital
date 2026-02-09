import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogin() {
    console.log('Testing login flow...');

    // Find a test user
    const user = await prisma.user.findFirst({
        include: { profile: true }
    });

    if (!user) {
        console.log('No users found in database');
        return;
    }

    console.log('Found user:', {
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        role: user.profile?.role
    });

    await prisma.$disconnect();
}

testLogin().catch(console.error);
