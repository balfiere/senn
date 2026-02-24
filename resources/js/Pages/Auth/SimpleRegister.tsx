import { OidcButtons } from '@/Components/Auth/OidcButtons';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Form, Head, Link, usePage } from '@inertiajs/react';

interface OidcProvider {
    slug: string;
    name: string;
}

export default function SimpleRegister() {
    const { oidc } = usePage<{
        oidc: { enabled: boolean; providers: OidcProvider[] };
    }>().props;

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-foreground text-2xl">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Start tracking your knitting projects
                    </CardDescription>
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
                                <FormField
                                    label="Name"
                                    error={errors.name}
                                    required
                                >
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="Your name"
                                        required
                                        autoComplete="name"
                                        autoFocus
                                    />
                                </FormField>
                                <FormField
                                    label="Username"
                                    error={errors.username}
                                    required
                                >
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="your_username"
                                        required
                                        autoComplete="username"
                                    />
                                </FormField>
                                <FormField
                                    label="Password"
                                    error={errors.password}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                <FormField
                                    label="Confirm Password"
                                    error={errors.password_confirmation}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Creating account...'
                                        : 'Sign Up'}
                                </Button>
                            </>
                        )}
                    </Form>

                    {oidc.enabled && (
                        <OidcButtons
                            providers={oidc.providers}
                            actionVerb="up"
                            className="mt-4"
                        />
                    )}

                    <div className="text-muted-foreground mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
