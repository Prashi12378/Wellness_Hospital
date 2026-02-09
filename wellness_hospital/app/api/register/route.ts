import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
        }

        // Validate Password Complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
            }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate UHID
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const uhid = `WH-${dateStr}-${randomSuffix}`;

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        email: email,
                        firstName: name.split(' ')[0],
                        lastName: name.split(' ').slice(1).join(' '),
                        role: "patient",
                        uhid: uhid
                    }
                }
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email, name: user.name } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
