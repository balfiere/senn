import { cn } from '@/lib/utils';

interface ProgressRingProps {
    current: number;
    total: number | null;
    size?: number;
    strokeWidth?: number;
    className?: string;
    children?: React.ReactNode;
}

export function ProgressRing({
    current,
    total,
    size = 100,
    strokeWidth = 6,
    className,
    children,
}: ProgressRingProps) {
    const radius = 38; // Default radius in viewBox 0 0 100 100
    const circumference = 2 * Math.PI * radius;
    const progress = total ? (current / total) * 100 : 0;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div
            className={cn('relative', className)}
            style={{ width: size, height: size }}
        >
            <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 100 100"
            >
                {/* Background ring */}
                <circle
                    cx={50}
                    cy={50}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/20"
                />
                {/* Progress ring */}
                {total && total > 0 && (
                    <circle
                        cx={50}
                        cy={50}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="text-primary transition-all duration-300"
                    />
                )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
