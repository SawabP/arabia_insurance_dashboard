import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAction } from './actions';
import { DASHBOARD_AUTH_COOKIE, DASHBOARD_AUTH_COOKIE_VALUE, DASHBOARD_AUTH_USERNAME } from '@/lib/simple-auth';

interface AuthPageProps {
    searchParams?: {
        error?: string;
    };
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
    const cookieStore = await cookies();
    const isAuthed = cookieStore.get(DASHBOARD_AUTH_COOKIE)?.value === DASHBOARD_AUTH_COOKIE_VALUE;

    if (isAuthed) {
        redirect('/');
    }

    const error = searchParams?.error;
    const errorMessage =
        error === 'invalid'
            ? 'Invalid username or password.'
            : error === 'config'
                ? 'Auth password is not configured in the container environment.'
                : null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-xl border-slate-200/80">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Dashboard Access</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Enter the temporary credentials to access the Arabia Insurance dashboard.
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
                            <label htmlFor="username" className="text-sm font-medium">Username</label>
                            <Input
                                id="username"
                                name="username"
                                autoComplete="username"
                                placeholder="Username"
                                defaultValue={DASHBOARD_AUTH_USERNAME}
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

                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>

                    <p className="text-xs text-muted-foreground">
                        Username: <span className="font-mono">{DASHBOARD_AUTH_USERNAME}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Password is read from the Docker container environment variable{' '}
                        <span className="font-mono">DASHBOARD_ACCESS_PASSWORD</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/" className="underline underline-offset-2">Back to dashboard</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
