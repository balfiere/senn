import { Head, Link } from '@inertiajs/react';

import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';

export default function PasswordResetSuccess() {
    return (
        <GuestLayout>
            <Head title="Password Reset Success" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Password Reset Successful
                    </CardTitle>
                    <CardDescription>
                        Your password has been reset successfully. You can now
                        sign in with your new password.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col">
                    <Button asChild size="lg">
                        <Link href={route('login')}>Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
