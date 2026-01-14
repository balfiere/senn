import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground">Sign in to manage your knitting projects</CardDescription>
                </CardHeader>
                <CardContent>
                    {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

                    <form onSubmit={submit}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="border-input"
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-foreground">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="border-input"
                                    autoComplete="current-password"
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember-me"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                />
                                <Label htmlFor="remember-me" className="cursor-pointer text-sm font-normal text-muted-foreground">
                                    Remember me on this device
                                </Label>
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href={route('register')} className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Sign up
                            </Link>
                        </div>
                        {canResetPassword && (
                            <div className="mt-2 text-center text-sm">
                                <Link
                                    href={route('password.request')}
                                    className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
