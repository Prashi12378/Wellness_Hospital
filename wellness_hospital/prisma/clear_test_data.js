
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data cleanup...');

    try {
        // 1. Find all identifiers for test patients (role = 'patient')
        const testProfiles = await prisma.profile.findMany({
            where: { role: 'patient' },
            select: { id: true, userId: true }
        });

        const profileIds = testProfiles.map(p => p.id);
        const userIds = testProfiles.map(p => p.userId);

        console.log(`Found ${profileIds.length} patient profiles to clear.`);

        if (profileIds.length > 0) {
            // 2. Delete Invoices (and InvoiceItems via Cascade)
            // Invoices are linked to Admission or directly to Patient (via patientName, but loosely).
            // Schema has `admissionId` but not explicit `patientId` relation on Invoice, just string `patientName`.
            // However, we should clear invoices linked to these admissions.

            // Find admissions for these patients
            const admissions = await prisma.admission.findMany({
                where: { patientId: { in: profileIds } },
                select: { id: true }
            });
            const admissionIds = admissions.map(a => a.id);

            console.log(`Found ${admissionIds.length} admissions.`);

            // Delete Invoices linked to these admissions
            const deleteInvoices = await prisma.invoice.deleteMany({
                where: { admissionId: { in: admissionIds } }
            });
            console.log(`Deleted ${deleteInvoices.count} invoices.`);

            // 3. Delete Admission related data (Cascade should handle, but explicit for safety/clarity)
            // HospitalCharge, LabRecord, Surgery, ClinicalNote -> Admission (Cascade)
            // We can directly delete Admissions
            const deleteAdmissions = await prisma.admission.deleteMany({
                where: { id: { in: admissionIds } }
            });
            console.log(`Deleted ${deleteAdmissions.count} admissions.`);

            // 4. Delete Prescriptions
            const deletePrescriptions = await prisma.prescription.deleteMany({
                where: { patientId: { in: profileIds } }
            });
            console.log(`Deleted ${deletePrescriptions.count} prescriptions.`);

            // 5. Delete Appointments
            const deleteAppointments = await prisma.appointment.deleteMany({
                where: { patientId: { in: profileIds } }
            });
            console.log(`Deleted ${deleteAppointments.count} appointments.`);

            // 6. Delete Profiles 
            // (Actually, deleting User should cascade Profile, but let's be explicit about the Target)
            // But we can just delete the Users.
            const deleteUsers = await prisma.user.deleteMany({
                where: { id: { in: userIds } }
            });
            console.log(`Deleted ${deleteUsers.count} users (and their profiles).`);

            // 7. Cleanup any stray Invoices that might not be linked to admission but have patientName of deleted users? 
            // Risky if names match real people. Sticking to relational deletion for now.

            // 8. Cleanup stray generic appointments/prescriptions/invoices if needed?
            // The user asked to clear "all patients and appointments that are used to test".

            // Let's also clear stray appointments/prescriptions that might not rely on profile ID if any?
            // Schema requires patientId for Appointment/Prescription/Admission. So we are good.
        } else {
            console.log("No test patients found.");
        }

        console.log('Cleanup complete!');

    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
