import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormGroup({
  title,
  description,
  className,
  children,
  ...props
}: FormGroupProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-xs font-medium uppercase text-muted-foreground">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}