import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        console.log("Middleware hitting:", req.nextUrl.pathname);
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                console.log("Middleware authorized token:", !!token);
                return !!token;
            },
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/portal/:path*",
        "/dashboard/:path*",
    ],
};
