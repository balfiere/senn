import { Project } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Hook to manage stopwatch display logic.
 * The server is the source of truth for the accumulated seconds and start timestamp.
 */
export function useStopwatch(project: Project) {
    const [displaySeconds, setDisplaySeconds] = useState(project.stopwatch_seconds);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        const updateDisplay = () => {
            if (project.stopwatch_running && project.stopwatch_started_at) {
                const start = new Date(project.stopwatch_started_at).getTime();
                const now = Date.now();
                const elapsed = Math.max(0, Math.floor((now - start) / 1000));
                setDisplaySeconds(project.stopwatch_seconds + elapsed);
            } else {
                setDisplaySeconds(project.stopwatch_seconds);
            }
        };

        updateDisplay(); // initial sync

        if (project.stopwatch_running) {
            interval = setInterval(updateDisplay, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [
        project.stopwatch_running,
        project.stopwatch_seconds,
        project.stopwatch_started_at,
    ]);

    return displaySeconds;
}

/**
 * Higher-level helper for formatting seconds into HH:MM:SS
 */
export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
