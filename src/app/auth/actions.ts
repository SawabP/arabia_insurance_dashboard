'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BACKEND_AUTH_COOKIE } from '@/lib/backend-auth';
import { backendRequest, BackendApiError, type LoginResponse } from '@/lib/backend-api';

export async function loginAction(formData: FormData) {
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
        redirect('/auth?error=invalid');
    }

    try {
        const response = await backendRequest<LoginResponse>('/api/v1/auth/login', {
            method: 'POST',
            auth: false,
            redirectOnUnauthorized: false,
            body: {
                email,
                password,
            },
        });

        const cookieStore = await cookies();
        cookieStore.set(BACKEND_AUTH_COOKIE, response.token.access_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: response.token.expires_in_seconds,
        });

        redirect('/');
    } catch (error) {
        if (error instanceof BackendApiError && error.status === 401) {
            redirect('/auth?error=invalid');
        }

        console.error('loginAction error:', error);
        redirect('/auth?error=server');
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(BACKEND_AUTH_COOKIE);
    redirect('/auth');
}
