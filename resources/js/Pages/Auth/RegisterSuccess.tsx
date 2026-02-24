import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { MailIcon } from '@/Components/ui/mail-icon';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function RegisterSuccess() {
    return (
        <GuestLayout>
            <Head title="Check Your Email" />

            <Card className="border-border text-center">
                <CardHeader>
                    <MailIcon />
                    <CardTitle className="text-foreground text-2xl">
                        Check Your Email
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        We&apos;ve sent you a confirmation link. Please check
                        your email to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href={route('login')}
                        className="text-primary hover:text-primary/80 text-sm underline underline-offset-4"
                    >
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
