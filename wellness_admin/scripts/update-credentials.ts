const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
    const creds = {
        admin: { username: 'wellness_admin', password: 'Shashank@87901' },
        staff: { username: 'frontdesk_exec', password: 'Wellness_Front_Desk@8383' },
        pharmacy: { username: 'pharma_user', password: 'Wellness_Pharma@87901' },
        lab: { username: 'lab_tech', password: 'Wellness_Lab@8383' },
    };

    // 1. Admin (wellnesshospital8383@gmail.com)
    console.log('Updating Admin...');
    await p.user.update({
        where: { email: 'wellnesshospital8383@gmail.com' },
        data: { username: creds.admin.username, password: await bcrypt.hash(creds.admin.password, 10) }
    });
    console.log('✅ Admin done');

    // 2. Staff (pharmacist@wellness.com)
    console.log('Updating Staff...');
    await p.user.update({
        where: { email: 'pharmacist@wellness.com' },
        data: { username: creds.staff.username, password: await bcrypt.hash(creds.staff.password, 10) }
    });
    console.log('✅ Staff done');

    // 3. Pharmacy - create separate user if not exists
    console.log('Setting up Pharmacy...');
    const pharmaHash = await bcrypt.hash(creds.pharmacy.password, 10);
    const existing = await p.user.findUnique({ where: { username: 'pharma_user' } });
    if (existing) {
        await p.user.update({
            where: { username: 'pharma_user' },
            data: { password: pharmaHash }
        });
        console.log('✅ Pharmacy updated');
    } else {
        const newUser = await p.user.create({
            data: {
                username: creds.pharmacy.username,
                email: 'pharmacy@wellness-hospital.in',
                password: pharmaHash,
                name: 'Pharmacy Staff',
            }
        });
        await p.profile.create({
            data: {
                userId: newUser.id,
                email: 'pharmacy@wellness-hospital.in',
                firstName: 'Pharmacy',
                lastName: 'Staff',
                role: 'staff',
            }
        });
        console.log('✅ Pharmacy user created');
    }

    // 4. Lab (lab_tech)
    console.log('Updating Lab...');
    await p.user.update({
        where: { username: 'lab_tech' },
        data: { password: await bcrypt.hash(creds.lab.password, 10) }
    });
    console.log('✅ Lab done');

    console.log('\n=== ALL DONE ===');
}

main().catch(console.error).finally(() => p.$disconnect());
