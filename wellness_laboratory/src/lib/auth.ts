import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
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
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                        include: { profile: true }
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        return null;
                    }

                    const role = user.profile?.role?.toString().toLowerCase() || "patient";
                    // For Lab portal, we expect "lab" or similar role. 
                    // Adjust based on actual role naming in DB.
                    if (role !== "lab" && role !== "laboratory") {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: role,
                        profileId: user.profile?.id,
                        firstName: user.profile?.firstName,
                        lastName: user.profile?.lastName
                    };
                } catch (error) {
                    console.error("[Auth] Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.profileId = (user as any).profileId;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            }
            if (trigger === "update" && session?.name) {
                token.name = session.name;
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
                session.user.name = token.name;
            }
            return session;
        }
    }
};
