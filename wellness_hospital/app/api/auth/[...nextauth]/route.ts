import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                phone: { label: "Phone", type: "text" },
                code: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                // --- OTP LOGIN PATH ---
                if (credentials?.phone && credentials?.code) {
                    const phone = credentials.phone;
                    const code = credentials.code;

                    // Verify OTP from DB
                    const otpRecord = await prisma.otp.findUnique({
                        where: { phone }
                    });

                    if (!otpRecord || otpRecord.code !== code || new Date() > otpRecord.expiresAt) {
                        return null; // Invalid OTP
                    }

                    // Find User via Profile
                    const profile = await prisma.profile.findFirst({
                        where: { phone },
                        include: { user: true }
                    });

                    if (profile && profile.user) {
                        // Success! Delete used OTP (Optional: or keep for short window?)
                        await prisma.otp.delete({ where: { phone } });

                        return {
                            id: profile.user.id,
                            email: profile.user.email,
                            name: profile.user.name,
                            image: profile.user.image,
                            role: profile.role,
                            uhid: profile.uhid
                        };
                    } else {
                        // User needs to register. Return null here causes error.
                        // We should have registered before calling signIn() if new.
                        return null;
                    }
                }

                // --- EMAIL/PASSWORD LOGIN PATH ---
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.trim();
                const password = credentials.password.trim();

                // 1. Check if user exists
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { profile: true }
                });

                if (!user || !user.password) {
                    return null;
                }

                // 2. Validate Password
                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.profile?.role || "patient",
                    uhid: user.profile?.uhid
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.uhid = (user as any).uhid;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).uhid = token.uhid;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
