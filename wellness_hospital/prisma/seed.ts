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
    const pharmacyEmail = 'wellnesshospital8383@gmail.com';
    const pharmacyPassword = await hash('Wellness_8383', 12);
    console.log(`Seeding pharmacist: ${pharmacyEmail}...`);

    const pharmacist = await prisma.user.upsert({
        where: { email: pharmacyEmail },
        update: {
            password: pharmacyPassword,
        },
        create: {
            email: pharmacyEmail,
            password: pharmacyPassword,
            name: 'Wellness Pharmacy',
            profile: {
                create: {
                    email: pharmacyEmail,
                    firstName: 'Wellness',
                    lastName: 'Pharmacy',
                    role: 'staff', // Using 'staff' role
                    phone: '8383838383'
                }
            }
        },
    });
    console.log(`Created pharmacist with id: ${pharmacist.id}`);

    // Add Dr. Nikhita
    const drNikhitaEmail = 'dr.nikhita@wellness-hospital.health';
    console.log(`Seeding doctor: ${drNikhitaEmail}...`);
    await prisma.user.upsert({
        where: { email: drNikhitaEmail },
        update: {},
        create: {
            email: drNikhitaEmail,
            password,
            name: 'Dr. Nikhita',
            profile: {
                create: {
                    email: drNikhitaEmail,
                    firstName: 'Nikhita',
                    lastName: '',
                    role: 'doctor',
                    specialization: 'General Medicine',
                    qualifications: 'MBBS',
                    experience: 5,
                    consultationFee: 500,
                    phone: '6366662245',
                    bio: 'Experienced general physician specializing in primary care and family medicine.',
                    availableTimings: [
                        { day: "Mon-Fri", start: "09:00 AM", end: "05:00 PM" },
                        { day: "Saturday", start: "09:00 AM", end: "01:00 PM" }
                    ]
                }
            }
        }
    });

    // Add Dr. Pushpa
    const drPushpaEmail = 'dr.pushpa@wellness-hospital.health';
    console.log(`Seeding doctor: ${drPushpaEmail}...`);
    await prisma.user.upsert({
        where: { email: drPushpaEmail },
        update: {},
        create: {
            email: drPushpaEmail,
            password,
            name: 'Dr. Pushpa',
            profile: {
                create: {
                    email: drPushpaEmail,
                    firstName: 'Pushpa',
                    lastName: '',
                    role: 'doctor',
                    specialization: 'Ayurveda',
                    qualifications: 'BAMS',
                    experience: 8,
                    consultationFee: 400,
                    phone: '6366662245',
                    bio: 'Certified Ayurvedic practitioner with expertise in traditional medicine and holistic healing.',
                    availableTimings: [
                        { day: "Mon-Fri", start: "10:00 AM", end: "06:00 PM" },
                        { day: "Saturday", start: "10:00 AM", end: "02:00 PM" }
                    ]
                }
            }
        }
    });

}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
