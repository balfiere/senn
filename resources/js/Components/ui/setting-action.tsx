import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SettingActionRenderProps {
    processing: boolean;
    setProcessing: (processing: boolean) => void;
}

export interface SettingActionProps {
    icon: React.ReactNode;
    title: string;
    variant?: 'default' | 'destructive';
    action?: () => Promise<void>;
    disabled?: boolean;
    processingText?: string;
}

export function SettingAction({
    icon,
    title,
    variant = 'default',
    action,
    disabled,
    processingText,
}: SettingActionProps) {
    const [processing, setProcessing] = React.useState(false);

    const handleClick = async () => {
        if (!disabled && action) {
            setProcessing(true);
            try {
                await action();
            } catch (error) {
                console.error('Action failed:', error);
            } finally {
                setProcessing(false);
            }
        }
    };

    const containerClasses = cn(
        'border-b transition-colors',
        variant === 'destructive' ? 'border-destructive/30' : 'border-border'
    );

    const buttonClasses = cn(
        'w-full flex items-center justify-between py-4 px-4 text-left transition-colors',
        variant === 'destructive'
            ? 'hover:bg-destructive/5'
            : 'hover:bg-muted/30',
        (disabled || processing) && 'opacity-50 cursor-not-allowed'
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

    const renderIcon = () => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn((icon.props as any)?.className, iconClasses),
            } as any);
        }
        return icon;
    };

    const displayedTitle = processing && processingText
        ? processingText
        : title;

    return (
        <div className={containerClasses}>
            <button
                onClick={handleClick}
                disabled={disabled || processing}
                className={buttonClasses}
                type="button"
            >
                <div className={iconContainerClasses}>
                    {renderIcon()}
                    <span className={titleClasses}>{displayedTitle}</span>
                </div>
            </button>
        </div>
    );
}