import { type NextAuthOptions } from "next-auth";
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

                // 1. Check if user exists
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { profile: true } // Include profile to get role
                });

                if (!user || !user.password) {
                    return null;
                }

                // 2. Validate Password with bcrypt
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    // Additional fields to pass to token
                    role: user.profile?.role || "patient",
                    firstName: user.profile?.firstName,
                    lastName: user.profile?.lastName,
                    specialization: user.profile?.specialization,
                    qualifications: user.profile?.qualifications,
                    profileId: user.profile?.id
                };
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
