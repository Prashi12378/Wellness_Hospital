import { prisma } from '@/lib/db';

async function testPrismaConnection() {
    console.log('🔍 Testing Prisma Database Connection...\n');

    try {
        // Test 1: Database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Test 2: Count users
        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users in database`);

        // Test 3: Find a test user
        const testUser = await prisma.user.findFirst({
            include: { profile: true }
        });

        if (testUser) {
            console.log('✅ Sample user found:', {
                email: testUser.email,
                name: testUser.name,
                hasPassword: !!testUser.password,
                role: testUser.profile?.role,
                uhid: testUser.profile?.uhid
            });
        } else {
            console.log('⚠️  No users found in database');
        }

        // Test 4: Check NextAuth tables
        const accountCount = await prisma.account.count();
        const sessionCount = await prisma.session.count();
        console.log(`✅ NextAuth integration: ${accountCount} accounts, ${sessionCount} sessions`);

        console.log('\n✅ All Prisma checks passed!');

    } catch (error) {
        console.error('❌ Prisma connection error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrismaConnection();
