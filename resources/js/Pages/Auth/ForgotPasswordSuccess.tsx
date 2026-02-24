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
import { Clock } from 'lucide-react';

export default function ForgotPasswordSuccess() {
    return (
        <GuestLayout>
            <Head title="Check Your Email" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <MailIcon />
                    <CardTitle className="text-foreground text-2xl">
                        Check Your Email
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        We've sent you a password reset link. Please check your
                        email and follow the instructions.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="text-secondary-foreground p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Important:</span>
                        </div>
                        <p>
                            The reset link will expire in 1 hour. If you don't
                            see the email, check your spam folder.
                        </p>
                    </div>

                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="text-primary hover:text-primary/80 text-sm underline underline-offset-4"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
