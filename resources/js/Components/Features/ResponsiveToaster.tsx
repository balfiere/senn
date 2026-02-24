import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export function ResponsiveToaster() {
    const [isMobile, setIsMobile] = useState(false);
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 880);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <Toaster
            position={isMobile ? 'bottom-center' : 'bottom-right'}
            toastOptions={{
                className:
                    'bg-card text-card-foreground border-border shadow-lg',
                style: {
                    borderRadius: '0px',
                },
            }}
        />
    );
}
