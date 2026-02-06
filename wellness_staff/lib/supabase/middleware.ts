import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('your-supabase-url')) return response

    const supabase = createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                request.cookies.set({
                    name,
                    value,
                    ...options,
                })
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })
                response.cookies.set({
                    name,
                    value,
                    ...options,
                })
            },
            remove(name: string, options: CookieOptions) {
                request.cookies.set({
                    name,
                    value: '',
                    ...options,
                })
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })
                response.cookies.set({
                    name,
                    value: '',
                    ...options,
                })
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes logic
    const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
    const isProfileSetup = request.nextUrl.pathname === '/login/profile-setup'
    const isLoginPage = request.nextUrl.pathname === '/login'

    if (isPortalRoute) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (!user.user_metadata?.full_name && !isProfileSetup) {
            return NextResponse.redirect(new URL('/login/profile-setup', request.url))
        }
    }

    if (user && isLoginPage && user.user_metadata?.full_name) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}
