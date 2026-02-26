
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findPortalUsers() {
    try {
        const users = await prisma.user.findMany({
            include: { profile: true }
        });

        // Filter for potential portal users based on roles and common usernames
        const portalUsers = users.filter(u =>
            ['admin', 'staff', 'lab'].includes(u.profile?.role || '') ||
            u.username?.includes('admin') ||
            u.username?.includes('staff') ||
            u.username?.includes('lab') ||
            u.username?.includes('pharmacy')
        );

        console.log("Potential Portal Users:", JSON.stringify(portalUsers.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.profile?.role,
            firstName: u.profile?.firstName,
            lastName: u.profile?.lastName
        })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findPortalUsers();
