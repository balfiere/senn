import { useState, useEffect } from 'react';

export interface ToolbarVisibility {
    showAnnotationTools: boolean;      // Stage 1: annotation tools visible
    showResetZoom: boolean;            // Stage 2: reset zoom button visible
    showSearchBar: boolean;            // Stage 3: search bar visible
    showZoomLabel: boolean;            // Stage 4: zoom percentage visible
    showZoomControls: boolean;         // Stage 5: zoom buttons visible
}

// Breakpoints in pixels (viewport width)
const BREAKPOINTS = {
    ANNOTATION_TOOLS: 1060,  // Collapse tools earlier to avoid sidebar collisions
    SEARCH_BAR: 600,         // Keep search bar visible longer
    RESET_ZOOM: 500,         // Keep reset zoom visible longer
    ZOOM_LABEL: 400,         // Hide zoom label at 400px
    ZOOM_CONTROLS: 350,      // Keep zoom buttons visible until 350px
} as const;

/**
 * Hook to track viewport width and determine which toolbar items should be visible.
 * Uses window resize events for reliable viewport detection.
 * 
 * Note: We measure window.innerWidth (the viewport) rather than container width
 * because the toolbar container's width is constrained by its content and won't
 * shrink below the combined width of its buttons.
 */
export function useToolbarBreakpoint(): ToolbarVisibility {
    const [visibility, setVisibility] = useState<ToolbarVisibility>(() => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
        return calculateVisibility(width);
    });

    useEffect(() => {
        const updateVisibility = () => {
            setVisibility(calculateVisibility(window.innerWidth));
        };

        updateVisibility();
        window.addEventListener('resize', updateVisibility);
        return () => window.removeEventListener('resize', updateVisibility);
    }, []);

    return visibility;
}

function calculateVisibility(width: number): ToolbarVisibility {
    // Annotation tools:
    // - Collapsed if < 800 (mobile/tablet narrow)
    // - Collapsed if between 880 and 1060 (desktop with sidebar crunch)
    // - Visible otherwise
    const isCrunched = width >= 880 && width < 1060;
    const isMobileSize = width < 800;

    return {
        showAnnotationTools: !isCrunched && !isMobileSize,
        showSearchBar: width >= BREAKPOINTS.SEARCH_BAR,
        showResetZoom: width >= BREAKPOINTS.RESET_ZOOM,
        showZoomLabel: width >= BREAKPOINTS.ZOOM_LABEL,
        showZoomControls: width >= BREAKPOINTS.ZOOM_CONTROLS,
    };
}
