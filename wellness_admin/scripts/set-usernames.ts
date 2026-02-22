// Script to set usernames and passwords for existing users
// Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/set-usernames.ts
// OR: npx tsx scripts/set-usernames.ts

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PORTAL_CREDENTIALS = [
    { role: 'admin', username: 'wellness_admin', password: 'Admin@2026' },
    { role: 'staff', username: 'frontdesk_exec', password: 'Staff@2026' },
    { role: 'doctor', username: 'dr_wellness', password: 'Doctor@2026' },
    { role: 'lab', username: 'lab_tech', password: 'Lab@2026' },
];

// Pharmacy user - look for staff role users with pharmacy-related email
const PHARMACY_CREDENTIALS = { username: 'pharma_user', password: 'Pharma@2026' };

async function main() {
    console.log('Setting usernames and passwords for existing users...\n');

    // Process role-based users
    for (const cred of PORTAL_CREDENTIALS) {
        const profile = await prisma.profile.findFirst({
            where: { role: cred.role },
            include: { user: true }
        });

        if (profile && profile.user) {
            const hashedPassword = await bcrypt.hash(cred.password, 10);
            await prisma.user.update({
                where: { id: profile.user.id },
                data: {
                    username: cred.username,
                    password: hashedPassword
                }
            });
            console.log(`✅ ${cred.role.toUpperCase()} → username: "${cred.username}", password: "${cred.password}" (user: ${profile.user.email})`);
        } else {
            console.log(`⚠️  No user found with role "${cred.role}"`);
        }
    }

    // Handle pharmacy user - look for users with pharmacy-related email or staff role with pharma email
    const pharmacyProfile = await prisma.profile.findFirst({
        where: {
            OR: [
                { email: { contains: 'pharma', mode: 'insensitive' } },
                { email: { contains: 'pharmacy', mode: 'insensitive' } }
            ]
        },
        include: { user: true }
    });

    if (pharmacyProfile && pharmacyProfile.user) {
        const hashedPassword = await bcrypt.hash(PHARMACY_CREDENTIALS.password, 10);
        await prisma.user.update({
            where: { id: pharmacyProfile.user.id },
            data: {
                username: PHARMACY_CREDENTIALS.username,
                password: hashedPassword
            }
        });
        console.log(`✅ PHARMACY → username: "${PHARMACY_CREDENTIALS.username}", password: "${PHARMACY_CREDENTIALS.password}" (user: ${pharmacyProfile.user.email})`);
    } else {
        console.log('⚠️  No pharmacy user found. You may need to create one from the admin portal.');
    }

    console.log('\n--- Summary of Login Credentials ---');
    console.log('| Portal     | Username       | Password     |');
    console.log('|------------|----------------|--------------|');
    console.log('| Admin      | wellness_admin | Admin@2026   |');
    console.log('| Staff      | frontdesk_exec | Staff@2026   |');
    console.log('| Pharmacy   | pharma_user    | Pharma@2026  |');
    console.log('| Doctor     | dr_wellness    | Doctor@2026  |');
    console.log('| Laboratory | lab_tech       | Lab@2026     |');
    console.log('--------------------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
