import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { ResponsiveToaster } from '@/Components/ResponsiveToaster';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">{children}</div>
            <ResponsiveToaster />
        </div>
    );
}
