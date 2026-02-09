const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const email = "wellnesshospital8383@gmail.com";
    const password = "Shashank@87901";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Updating/Creating admin user: ${email}`);

    // 1. Degrade all current admins
    const degradedCount = await prisma.profile.updateMany({
        where: { role: "admin" },
        data: { role: "patient" }
    });
    console.log(`Degraded ${degradedCount.count} existing admin(s) to patient role.`);

    // 2. Upsert the target user
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log("User updated with new password.");
    } else {
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: "Wellness Admin"
            }
        });
        console.log("New user created.");
    }

    // 3. Upsert the profile with admin role
    await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            email: email,
            role: "admin",
            firstName: "Wellness",
            lastName: "Hospital Admin"
        },
        update: {
            role: "admin"
        }
    });

    console.log("Admin access restricted to only this account.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
