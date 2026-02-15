import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL_URL;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
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

                const originalEmail = credentials.email;
                const lowerEmail = originalEmail.toLowerCase();

                try {
                    console.log("[Auth] Looking up user by email:", originalEmail);
                    // 1. Check if user exists (trying both original and lowercase)
                    let user = await prisma.user.findUnique({
                        where: { email: originalEmail },
                        include: { profile: true }
                    });

                    if (!user && originalEmail !== lowerEmail) {
                        console.log("[Auth] User not found with original casing, trying lowercase:", lowerEmail);
                        user = await prisma.user.findUnique({
                            where: { email: lowerEmail },
                            include: { profile: true }
                        });
                    }

                    if (!user) {
                        console.error("[Auth] User not found in database with email:", originalEmail, "or", lowerEmail);
                        return null;
                    }

                    if (!user.password) {
                        console.error("[Auth] User has no password set:", user.email);
                        return null;
                    }

                    // 2. Validate Password with bcrypt
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        console.error("[Auth] Invalid password for:", user.email);
                        return null;
                    }

                    // 3. Strict Role Validation for Doctor Portal
                    const role = user.profile?.role?.toString().toLowerCase() || "patient";
                    console.log(`[Auth] User found: ${user.email}, Role: ${role}`);

                    if (role !== "doctor") {
                        console.error(`[Auth] Unauthorized role for doctor portal: ${role} (${user.email})`);
                        return null;
                    }

                    console.log("[Auth] Doctor signed in successfully:", user.email);

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
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}wellness-doctor.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: useSecureCookies,
            },
        },
    },
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
