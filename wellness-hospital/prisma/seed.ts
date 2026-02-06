const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await hash('password123', 12);
    const email = 'admin@wellness.com';

    console.log(`Seeding user: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            name: 'Admin User',
            profile: {
                create: {
                    email,
                    firstName: 'System',
                    lastName: 'Admin',
                    role: 'admin',
                    phone: '555-0123'
                }
            }
        },
    });


    console.log(`Created user with id: ${user.id}`);

    // Create a Doctor User
    const doctorEmail = 'dr.sanath@wellness.com';
    console.log(`Seeding doctor: ${doctorEmail}...`);

    const doctor = await prisma.user.upsert({
        where: { email: doctorEmail },
        update: {},
        create: {
            email: doctorEmail,
            password, // same password for simplicity
            name: 'Dr. Sanath',
            profile: {
                create: {
                    email: doctorEmail,
                    firstName: 'Sanath',
                    lastName: 'Kumar',
                    role: 'doctor',
                    specialization: 'Cardiology',
                    qualifications: 'MBBS, MD',
                    experience: 10,
                    consultationFee: 500,
                    phone: '555-9876'
                }
            }
        },
    });
    console.log(`Created doctor with id: ${doctor.id}`);

    // Create a Verified Pharmacist
    const pharmacyEmail = 'pharmacist@wellness.com';
    console.log(`Seeding pharmacist: ${pharmacyEmail}...`);

    const pharmacist = await prisma.user.upsert({
        where: { email: pharmacyEmail },
        update: {},
        create: {
            email: pharmacyEmail,
            password, // same password
            name: 'Head Pharmacist',
            profile: {
                create: {
                    email: pharmacyEmail,
                    firstName: 'Pharmacy',
                    lastName: 'Head',
                    role: 'staff', // Using 'staff' role but access restricted to pharmacy in logic
                    phone: '555-PHARM'
                }
            }
        },
    });
    console.log(`Created pharmacist with id: ${pharmacist.id}`);
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
