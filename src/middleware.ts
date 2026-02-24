import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_COOKIE_VALUE } from '@/lib/simple-auth';

const PUBLIC_PATHS = new Set(['/auth']);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PUBLIC_PATHS.has(pathname)) {
        return NextResponse.next();
    }

    const isAuthed = request.cookies.get(DASHBOARD_AUTH_COOKIE)?.value === DASHBOARD_AUTH_COOKIE_VALUE;

    if (isAuthed) {
        return NextResponse.next();
    }

    const authUrl = new URL('/auth', request.url);
    return NextResponse.redirect(authUrl);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
