import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';

export default function PasswordResetSuccess() {
    return (
        <GuestLayout>
            <Head title="Password Reset Success" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
                    <CardDescription>
                        Your password has been reset successfully. You can now sign in with your new password.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            Please check your email for the confirmation. You can now log in with your new password.
                        </p>
                    </div>
                    
                    <Link 
                        href={route('login')}
                        className="block w-full py-2 px-4 bg-primary text-white text-center rounded hover:bg-primary/90 transition-colors"
                    >
                        Back to Login
                    </Link>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}