import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import { OidcButtons } from '@/Components/Auth/OidcButtons';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, Form, usePage } from '@inertiajs/react';

interface OidcProvider {
    slug: string;
    name: string;
    button_text: string;
}

export default function Register() {
    const { oidc } = usePage<{ oidc: { enabled: boolean; providers: OidcProvider[] } }>().props;

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
                    <CardDescription className="text-muted-foreground">Start tracking your knitting projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        action={route('register')}
                        method="post"
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField label="Name" error={errors.name} required>
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="Your name"
                                        required
                                        autoComplete="name"
                                        autoFocus
                                    />
                                </FormField>
                                <FormField label="Email" error={errors.email} required>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="username"
                                    />
                                </FormField>
                                <FormField label="Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                <FormField label="Confirm Password" error={errors.password_confirmation} required>
                                    <Input
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Creating account...' : 'Sign Up'}
                                </Button>
                            </>
                        )}
                    </Form>

                    {oidc.enabled && <OidcButtons providers={oidc.providers} className="mt-4" />}

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href={route('login')} className="text-primary underline underline-offset-4 hover:text-primary/80">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}