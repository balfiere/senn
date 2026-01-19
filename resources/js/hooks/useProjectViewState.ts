import { useEffect, useState } from 'react';

export type ProjectView = 'counters' | 'pdf' | 'split';

interface ProjectViewStateOptions {
    initialView?: ProjectView;
    hasPdf: boolean;
}

/**
 * Hook to manage project view state and responsive behavior.
 */
export function useProjectViewState({ initialView = 'counters', hasPdf }: ProjectViewStateOptions) {
    const [view, setView] = useState<ProjectView>(initialView);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 880);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Determine effective view (mobile doesn't support split, no PDF means counters only)
    const effectiveView = !hasPdf
        ? 'counters'
        : isMobile && view === 'split'
            ? 'counters'
            : view;

    return {
        view,
        setView,
        isMobile,
        effectiveView,
    };
}
