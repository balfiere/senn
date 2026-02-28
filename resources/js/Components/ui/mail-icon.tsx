import { cva, type VariantProps } from 'class-variance-authority';
import { Mail } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const mailIconVariants = cva(
    "mx-auto flex h-12 w-12 items-center justify-center bg-primary/10",
    {
        variants: {
            variant: {
                circle: "rounded-full",
                square: "rounded-none",
            },
        },
        defaultVariants: {
            variant: "circle",
        },
    },
);

function MailIcon({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> &
    VariantProps<typeof mailIconVariants>) {
    return (
        <div className={cn(mailIconVariants({ variant, className }))} {...props}>
            <Mail className="h-6 w-6 text-primary" />
        </div>
    );
}

export { MailIcon, mailIconVariants };