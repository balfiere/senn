import { useState, useEffect } from 'react';

export interface ToolbarVisibility {
    showAnnotationTools: boolean;      // Stage 1: annotation tools visible
    showResetZoom: boolean;            // Stage 2: reset zoom button visible
    showSearchBar: boolean;            // Stage 3: search bar visible
    showZoomControls: boolean;         // Stage 4: zoom controls visible
}

// Breakpoints in pixels (viewport width)
// These are based on typical responsive design breakpoints
const BREAKPOINTS = {
    ANNOTATION_TOOLS: 768,   // Hide annotation tools below tablet width
    RESET_ZOOM: 640,         // Hide reset zoom on small tablets
    SEARCH_BAR: 550,         // Hide search bar on large phones
    ZOOM_CONTROLS: 480,      // Hide zoom controls on smaller phones
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
        // Initialize with current window width if available (SSR safe)
        const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
        return {
            showAnnotationTools: width >= BREAKPOINTS.ANNOTATION_TOOLS,
            showResetZoom: width >= BREAKPOINTS.RESET_ZOOM,
            showSearchBar: width >= BREAKPOINTS.SEARCH_BAR,
            showZoomControls: width >= BREAKPOINTS.ZOOM_CONTROLS,
        };
    });

    useEffect(() => {
        const updateVisibility = () => {
            const width = window.innerWidth;

            setVisibility({
                showAnnotationTools: width >= BREAKPOINTS.ANNOTATION_TOOLS,
                showResetZoom: width >= BREAKPOINTS.RESET_ZOOM,
                showSearchBar: width >= BREAKPOINTS.SEARCH_BAR,
                showZoomControls: width >= BREAKPOINTS.ZOOM_CONTROLS,
            });
        };

        // Initial measurement
        updateVisibility();

        // Listen for window resize
        window.addEventListener('resize', updateVisibility);

        return () => window.removeEventListener('resize', updateVisibility);
    }, []);

    return visibility;
}
