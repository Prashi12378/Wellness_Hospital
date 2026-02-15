import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("[Auth] Authorize called for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.error("[Auth] Missing credentials");
                    return null;
                }

                const email = credentials.email; // Removed .toLowerCase() to avoid mismatch

                try {
                    // 1. Check if user exists
                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: { profile: true } // Include profile to get role
                    });

                    if (!user) {
                        console.error("[Auth] User not found:", email);
                        return null;
                    }

                    if (!user.password) {
                        console.error("[Auth] User has no password set:", email);
                        return null;
                    }

                    // 2. Validate Password with bcrypt
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        console.error("[Auth] Invalid password for:", email);
                        return null;
                    }

                    // 3. Strict Role Validation for Doctor Portal
                    const role = user.profile?.role || "patient";
                    if (role !== "doctor") {
                        console.error(`[Auth] Unauthorized role for doctor portal: ${role} (${email})`);
                        return null;
                    }

                    console.log("[Auth] Doctor signed in successfully:", email);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        // Additional fields to pass to token
                        role: role,
                        firstName: user.profile?.firstName,
                        lastName: user.profile?.lastName,
                        specialization: user.profile?.specialization,
                        qualifications: user.profile?.qualifications,
                        profileId: user.profile?.id
                    };
                } catch (error) {
                    console.error("[Auth] Database error during sign-in:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.specialization = (user as any).specialization;
                token.qualifications = (user as any).qualifications;
                token.profileId = (user as any).profileId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
                (session.user as any).specialization = token.specialization;
                (session.user as any).qualifications = token.qualifications;
                (session.user as any).profileId = token.profileId;
            }
            return session;
        }
    }
};
