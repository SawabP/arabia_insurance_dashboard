import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BACKEND_AUTH_COOKIE, buildBackendUrl } from '@/lib/backend-auth';

const PUBLIC_PATHS = new Set(['/auth']);

function redirectToAuth(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete(BACKEND_AUTH_COOKIE);
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PUBLIC_PATHS.has(pathname)) {
        return NextResponse.next();
    }

    const token = request.cookies.get(BACKEND_AUTH_COOKIE)?.value;

    if (!token) {
        return redirectToAuth(request);
    }

    try {
        const response = await fetch(buildBackendUrl('/api/v1/auth/me'), {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            return NextResponse.next();
        }
    } catch (error) {
        console.error('middleware auth check failed:', error);
    }

    return redirectToAuth(request);
}

export const config = {
    // Skip Next internals and any static file in /public (anything with an extension)
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
