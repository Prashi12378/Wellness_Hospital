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
                console.log("[Auth] Authorize attempt for:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const email = credentials.email.toLowerCase();
                    let user = await prisma.user.findUnique({
                        where: { email: email },
                        include: { profile: true }
                    });

                    if (!user && credentials.email !== email) {
                        user = await prisma.user.findUnique({
                            where: { email: credentials.email },
                            include: { profile: true }
                        });
                    }

                    if (!user || !user.password) {
                        console.log("[Auth] User not found or no password:", credentials.email);
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        console.log("[Auth] Invalid password for:", credentials.email);
                        return null;
                    }

                    const role = user.profile?.role?.toString().toLowerCase() || "patient";
                    if (role !== "doctor") {
                        console.log("[Auth] Forbidden role:", role);
                        return null;
                    }

                    console.log("[Auth] Login successful:", user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: role,
                        profileId: user.profile?.id,
                        firstName: user.profile?.firstName,
                        lastName: user.profile?.lastName,
                        specialization: user.profile?.specialization,
                        qualifications: user.profile?.qualifications
                    };
                } catch (error) {
                    console.error("[Auth] Exception:", error);
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
                token.profileId = (user as any).profileId;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).profileId = token.profileId;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
            }
            return session;
        }
    }
};
