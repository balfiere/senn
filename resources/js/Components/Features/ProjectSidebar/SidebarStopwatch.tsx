import { Button } from "@/Components/ui/button"
import { Clock, Play, Pause, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarStopwatchProps {
    seconds: number
    isRunning: boolean
    onToggle: () => void
    onReset: () => void
    className?: string
    timeClassName?: string
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function SidebarStopwatch({
    seconds,
    isRunning,
    onToggle,
    onReset,
    className,
    timeClassName,
}: SidebarStopwatchProps) {
    return (
        <div className={cn("rounded-none border border-border p-3", className)}>
            <div className="flex items-center justify-center mb-2">
                <Clock className="mr-2 h-4 w-4 text-popover-foreground/60" />
                <span className={cn("font-mono text-popover-foreground", timeClassName)}>{formatTime(seconds)}</span>
            </div>
            <div className="flex gap-2">
                <Button
                    variant={isRunning ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={onToggle}
                >
                    {isRunning ? (
                        <>
                            <Pause className="mr-1 h-3 w-3" />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play className="mr-1 h-3 w-3" />
                            Start
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-muted/30 border-border"
                    onClick={onReset}
                    title="Reset"
                >
                    <RotateCcw className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
