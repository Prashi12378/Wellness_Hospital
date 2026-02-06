const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const bloodPackages = [
        { name: 'Basic Health Checkup', price: 999, originalPrice: 1299, includes: ['CBC', 'Blood Sugar'], icon: 'Activity', popular: false, type: 'BLOOD_COLLECTION' },
        { name: 'Complete Blood Count (CBC)', price: 250, originalPrice: 350, includes: ['Hemoglobin', 'WBC', 'RBC', 'Platelets'], icon: 'Droplet', popular: true, type: 'BLOOD_COLLECTION' },
        { name: 'Lipid Profile', price: 450, originalPrice: 600, includes: ['Cholesterol', 'Triglycerides', 'HDL', 'LDL'], icon: 'Heart', popular: true, type: 'BLOOD_COLLECTION' },
        { name: 'Thyroid Panel', price: 600, originalPrice: 800, includes: ['T3', 'T4', 'TSH'], icon: 'Activity', popular: false, type: 'BLOOD_COLLECTION' },
        { name: 'Diabetes Panel', price: 500, originalPrice: 750, includes: ['HbA1c', 'FBS', 'PPBS'], icon: 'Activity', popular: true, type: 'BLOOD_COLLECTION' },
        { name: 'Liver Function Test', price: 700, originalPrice: 1000, includes: ['SGOT', 'SGPT', 'Bilirubin', 'Albumin'], icon: 'Activity', popular: false, type: 'BLOOD_COLLECTION' },
    ]

    for (const pkg of bloodPackages) {
        await prisma.healthPackage.create({
            data: pkg
        })
    }

    console.log('Seeded Blood@Home packages successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
