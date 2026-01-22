import * as React from 'react';
import { Label } from '@/Components/ui/label';
import { Slider } from '@/Components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  displayValue?: (value: number) => string;
  error?: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  displayValue,
  error,
  required = false,
  className,
  description,
}: SliderFieldProps) {
  const display = displayValue
    ? displayValue(value)
    : suffix
      ? `${value}${suffix}`
      : `${value}`;

  const fieldId = React.useId();

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={fieldId}
          className={cn('text-xs', error && 'text-destructive')}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <span className="text-muted-foreground text-xs">{display}</span>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        <Slider
          id={fieldId}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className={cn(error && 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive')}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined}
        />
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