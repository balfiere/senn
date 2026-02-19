import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { OidcButtons } from '@/Components/Auth/OidcButtons';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, Form, usePage } from '@inertiajs/react';

interface OidcProvider {
    slug: string;
    name: string;
    button_text: string;
}

export default function SimpleLogin() {
    const { oidc } = usePage<{ oidc: { enabled: boolean; providers: OidcProvider[] } }>().props;

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground">Sign in to manage your knitting projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form action={route('login')} method="post" className="flex flex-col gap-4">
                        {({ processing, errors }) => (
                            <>
                                <FormField label="Username" error={errors.username} required>
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="your_username"
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

                    {oidc.enabled && <OidcButtons providers={oidc.providers} className="mt-4" />}

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-primary underline underline-offset-4 hover:text-primary/80">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}