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
                console.log("AUTH: authorize called with email:", credentials?.email);

                try {
                    // Wrap in timeout to prevent hanging
                    const authPromise = (async () => {
                        // --- EMAIL/PASSWORD LOGIN PATH ---
                        if (!credentials?.email || !credentials?.password) {
                            console.log("AUTH: Missing credentials");
                            return null;
                        }

                        const email = credentials.email.trim();
                        const password = credentials.password.trim();

                        console.log("AUTH: Looking up user:", email);

                        // 1. Check if user exists
                        const user = await prisma.user.findUnique({
                            where: { email },
                            include: { profile: true }
                        });

                        if (!user || !user.password) {
                            console.log("AUTH: User not found or has no password set:", email);
                            return null;
                        }

                        console.log("AUTH: User found, validating password");

                        // 2. Validate Password
                        const isValid = await bcrypt.compare(password, user.password);
                        console.log("AUTH: Password validation result:", isValid ? "SUCCESS" : "FAILED");

                        if (!isValid) {
                            return null;
                        }

                        console.log("AUTH: Returning user object");
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            role: user.profile?.role || "patient",
                            uhid: user.profile?.uhid
                        } as any;
                    })();

                    const timeoutPromise = new Promise<null>((resolve) =>
                        setTimeout(() => {
                            console.log("AUTH: Timeout reached");
                            resolve(null);
                        }, 10000)
                    );

                    const result = await Promise.race([authPromise, timeoutPromise]);
                    console.log("AUTH: authorize completed, result:", result ? "user found" : "null");
                    return result;
                } catch (error) {
                    console.error("AUTH: authorize exception:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore - custom user fields
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.uhid = user.uhid;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore - custom session fields
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.uhid = token.uhid;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
