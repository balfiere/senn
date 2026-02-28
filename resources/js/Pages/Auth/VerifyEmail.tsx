import { Form, Head, Link } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { MailIcon } from '@/Components/ui/mail-icon';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail() {
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <Card className="border-border text-center">
                <CardHeader>
                    <MailIcon />
                    <CardTitle className="text-foreground text-2xl">
                        Email Verification
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Before proceeding, please check your email for a
                        verification link. If you did not receive the email, we
                        will gladly send you another.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showSuccess && (
                        <div className="p-3 text-sm">
                            A new verification link has been sent to your email
                            address.
                        </div>
                    )}

                    <Form
                        action={route('verification.send')}
                        method="post"
                        onSuccess={() => {
                            setShowSuccess(true);
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                        }}
                        className="w-full"
                    >
                        <Button type="submit" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Verification Email
                        </Button>
                    </Form>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
                    >
                        Log Out
                    </Link>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
