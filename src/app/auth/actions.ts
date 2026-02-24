'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    DASHBOARD_AUTH_COOKIE,
    DASHBOARD_AUTH_COOKIE_VALUE,
    DASHBOARD_AUTH_PASSWORD_ENV,
    DASHBOARD_AUTH_USERNAME,
} from '@/lib/simple-auth';

export async function loginAction(formData: FormData) {
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');
    const expectedPassword = process.env[DASHBOARD_AUTH_PASSWORD_ENV];

    if (!expectedPassword) {
        redirect('/auth?error=config');
    }

    if (username !== DASHBOARD_AUTH_USERNAME || password !== expectedPassword) {
        redirect('/auth?error=invalid');
    }

    const cookieStore = await cookies();
    cookieStore.set(DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_COOKIE_VALUE, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 12, // 12 hours
    });

    redirect('/');
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(DASHBOARD_AUTH_COOKIE);
    redirect('/auth');
}
