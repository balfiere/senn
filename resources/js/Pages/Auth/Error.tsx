import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function Error() {
    return (
        <GuestLayout>
            <Head title="Authentication Error" />

            <Card className="border-border text-center">
                <CardHeader>
                    <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                        <AlertCircle className="text-destructive h-6 w-6" />
                    </div>
                    <CardTitle className="text-foreground text-2xl">
                        Authentication Error
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Something went wrong during authentication. Please try
                        again.
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
