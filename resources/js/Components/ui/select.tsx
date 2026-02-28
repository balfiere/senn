import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const selectVariants = cva(
    "border-input bg-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Select({
    className,
    variant,
    children,
    ...props
}: React.ComponentProps<'select'> &
    VariantProps<typeof selectVariants>) {
    return (
        <select
            data-slot="select"
            className={cn(selectVariants({ variant, className }))}
            {...props}
        >
            {children}
        </select>
    );
}

export { Select, selectVariants };