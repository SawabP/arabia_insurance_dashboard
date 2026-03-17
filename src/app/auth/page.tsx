import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { loginAction } from './actions';
import { getCurrentAccount } from '@/lib/backend-api';
import { SubmitButton } from './submit-button';

interface AuthPageProps {
    searchParams?: {
        error?: string;
    };
}

export const dynamic = 'force-dynamic';

export default async function AuthPage({ searchParams }: AuthPageProps) {
    const account = await getCurrentAccount();

    if (account) {
        redirect('/');
    }

    const error = searchParams?.error;
    const errorMessage =
        error === 'invalid'
            ? 'Invalid email or password.'
            : error === 'server'
                ? 'The dashboard could not reach the backend auth service.'
                : null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-xl border-slate-200/80">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Dashboard Access</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Sign in with your backend account credentials to access the Arabia Insurance dashboard.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errorMessage && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <form action={loginAction} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <SubmitButton />
                    </form>

                    <p className="text-xs text-muted-foreground">
                        Authentication is delegated to the backend API and the returned bearer token is stored in an <span className="font-mono">httpOnly</span> cookie.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/" className="underline underline-offset-2">Back to dashboard</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
