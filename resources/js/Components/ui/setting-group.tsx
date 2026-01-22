import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SettingGroupRenderProps {
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    processing: boolean;
    setProcessing: (processing: boolean) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export interface SettingGroupProps {
    icon: React.ReactNode;
    title: string;
    variant?: 'default' | 'destructive';
    children: (props: SettingGroupRenderProps) => React.ReactNode;
    defaultExpanded?: boolean;
}

export function SettingGroup({
    icon,
    title,
    variant = 'default',
    children,
    defaultExpanded = false,
}: SettingGroupProps) {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const [processing, setProcessing] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const containerClasses = cn(
        'border-b transition-colors',
        variant === 'destructive' ? 'border-destructive/30' : 'border-border'
    );

    const buttonClasses = cn(
        'w-full flex items-center justify-between py-4 px-4 text-left transition-colors',
        variant === 'destructive'
            ? 'hover:bg-destructive/5'
            : 'hover:bg-muted/30'
    );

    const iconContainerClasses = 'flex items-center gap-3';
    const iconClasses = cn(
        'h-4 w-4',
        variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    );
    const titleClasses = cn(
        'text-sm uppercase tracking-wider',
        variant === 'destructive' ? 'text-destructive' : ''
    );
    const chevronClasses = cn(
        'h-4 w-4',
        variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    );

    const renderIcon = () => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn((icon.props as any)?.className, iconClasses),
            } as any);
        }
        return icon;
    };

    return (
        <div className={containerClasses}>
            <button
                onClick={() => setExpanded(!expanded)}
                className={buttonClasses}
                type="button"
            >
                <div className={iconContainerClasses}>
                    {renderIcon()}
                    <span className={titleClasses}>{title}</span>
                </div>
                {expanded ? (
                    <ChevronUp className={chevronClasses} />
                ) : (
                    <ChevronDown className={chevronClasses} />
                )}
            </button>

            {expanded && (
                <div className="pb-6 pt-3 px-1">
                    {children({
                        expanded,
                        setExpanded,
                        processing,
                        setProcessing,
                        errors,
                        setErrors,
                    })}
                </div>
            )}
        </div>
    );
}