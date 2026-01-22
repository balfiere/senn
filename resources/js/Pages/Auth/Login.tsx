import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, Form } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    return (
        <GuestLayout>
            <Head title="Sign In" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground">Sign in to manage your knitting projects</CardDescription>
                </CardHeader>
                <CardContent>
                    {status && <div className="mb-4 text-sm font-medium">{status}</div>}

                    <Form action={route('login')} method="post" className="flex flex-col gap-4">
                        {({ processing, errors }) => (
                            <>
                                <FormField label="Email" error={errors.email} required>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </FormField>
                                <FormField label="Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </FormField>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember-me"
                                        name="remember"
                                        value="1"
                                    />
                                    <Label htmlFor="remember-me" className="cursor-pointer text-sm font-normal text-muted-foreground">
                                        Remember me on this device
                                    </Label>
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </>
                        )}
                    </Form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
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
                </CardContent>
            </Card>
        </GuestLayout>
    );
}