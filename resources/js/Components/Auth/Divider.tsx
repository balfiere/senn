interface DividerProps {
    children: React.ReactNode;
    className?: string;
}

export function Divider({ children, className = '' }: DividerProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{children}</span>
            </div>
        </div>
    );
}