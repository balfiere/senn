import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
                    <CardDescription className="text-muted-foreground">Start tracking your knitting projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit}>
                        <div className="flex flex-col gap-4">
                            <FormField label="Name" error={errors.name} required>
                                <Input
                                    type="text"
                                    placeholder="Your name"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                />
                            </FormField>
                            <FormField label="Email" error={errors.email} required>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                />
                            </FormField>
                            <FormField label="Password" error={errors.password} required>
                                <Input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </FormField>
                            <FormField label="Confirm Password" error={errors.password_confirmation} required>
                                <Input
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </FormField>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating account...' : 'Sign Up'}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href={route('login')} className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}