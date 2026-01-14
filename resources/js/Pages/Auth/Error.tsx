import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function Error() {
    return (
        <GuestLayout>
            <Head title="Authentication Error" />

            <Card className="border-border text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">Authentication Error</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Something went wrong during authentication. Please try again.
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
