import * as React from 'react';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  description?: string;
  id?: string;
}

export function FormField({
  label,
  error,
  required = false,
  className,
  children,
  description,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || React.useId();

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Label
        htmlFor={fieldId}
        className={cn('text-xs', error && 'text-destructive')}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, {
          id: fieldId,
          'aria-invalid': !!error,
          'aria-describedby': error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined,
          className: cn(
            (children as React.ReactElement<any>).props.className,
            error && 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
        })}
      </div>

      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}