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
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
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
                    console.log("LOGIN DEBUG: User not found or has no password set.", email);
                    return null;
                }

                // 2. Validate Password
                const isValid = await bcrypt.compare(password, user.password);
                console.log("LOGIN DEBUG: Password validation result:", isValid ? "SUCCESS" : "FAILED", "for user:", email);

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
