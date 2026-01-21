import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface Props {
    status?: string;
}

export default function VerifyEmail({ status }: Props) {
    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <Card className="border-border text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">Email Verification</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Before proceeding, please check your email for a verification link.
                        If you did not receive the email, we will gladly send you another.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'verification-link-sent' && (
                        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                            A new verification link has been sent to your email address.
                        </div>
                    )}

                    <Link
                        href={route('verification.send')}
                        method="post"
                        as="button"
                        className="w-full"
                    >
                        <Button className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Verification Email
                        </Button>
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        Log Out
                    </Link>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}