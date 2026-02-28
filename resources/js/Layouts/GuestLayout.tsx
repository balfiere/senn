import { PropsWithChildren } from 'react';

import { ResponsiveToaster } from '@/Components/Features/ResponsiveToaster';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="bg-background flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">{children}</div>
            <ResponsiveToaster />
        </div>
    );
}
