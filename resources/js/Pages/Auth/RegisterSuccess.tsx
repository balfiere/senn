import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';

export default function RegisterSuccess() {
    return (
        <GuestLayout>
            <Head title="Check Your Email" />

            <Card className="border-border text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        We&apos;ve sent you a confirmation link. Please check your email to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={route('login')} className="text-sm text-primary underline underline-offset-4 hover:text-primary/80">
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
