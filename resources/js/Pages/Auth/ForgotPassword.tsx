import { Form, Head, Link } from '@inertiajs/react';

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
import { MailIcon } from '@/Components/ui/mail-icon';
import GuestLayout from '@/Layouts/GuestLayout';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <MailIcon />
                    <CardTitle className="text-foreground text-2xl">
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your email address and we'll send you a link to
                        reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && <div className="mb-4 p-4 text-sm">{status}</div>}

                    <Form
                        action={route('password.email')}
                        method="post"
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField
                                    label="Email Address"
                                    error={errors.email}
                                    required
                                >
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </FormField>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Sending Reset Link...'
                                        : 'Send Reset Link'}
                                </Button>
                            </>
                        )}
                    </Form>
                    <div className="text-muted-foreground mt-4 text-center text-sm">
                        Remember your password?{' '}
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
