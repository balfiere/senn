import { useMemo } from 'react';
import { useSearch } from '@embedpdf/plugin-search/react';
import { useZoom } from '@embedpdf/plugin-zoom/react';

interface SearchLayerProps {
  documentId: string;
  pageIndex: number;
}

export function SearchLayer({ documentId, pageIndex }: SearchLayerProps) {
  const { state: searchState } = useSearch(documentId);
  const { state: zoomState } = useZoom(documentId);

  // Get the current scale from zoom state (1.0 = 100%)
  const scale = zoomState?.currentZoomLevel ?? 1;

  // Filter results for current page
  const pageResults = useMemo(() => {
    if (!searchState.active) return [];
    return searchState.results
      .map((result, originalIndex) => ({ result, originalIndex }))
      .filter(({ result }) => result.pageIndex === pageIndex);
  }, [searchState.results, searchState.active, pageIndex]);

  // Decide which results to show
  const resultsToShow = useMemo(() => {
    return pageResults.filter(
      ({ originalIndex }) =>
        searchState.showAllResults || originalIndex === searchState.activeResultIndex
    );
  }, [pageResults, searchState.showAllResults, searchState.activeResultIndex]);

  if (!searchState.active) return null;

  // Padding for search highlights (in points, scaled with zoom)
  const padding = 1.5 * scale;

  return (
    <div style={{ pointerEvents: 'none' }}>
      {resultsToShow.map(({ result, originalIndex }) =>
        result.rects.map((rect, rectIndex) => (
          <div
            key={`${originalIndex}-${rectIndex}`}
            style={{
              position: 'absolute',
              top: rect.origin.y * scale - padding * 2,
              left: rect.origin.x * scale - padding,
              width: rect.size.width * scale + padding * 2,
              height: rect.size.height * scale + padding * 4,
              backgroundColor:
                originalIndex === searchState.activeResultIndex ? '#f38ba8' : '#f5c2e7',
              mixBlendMode: 'multiply',
              opacity: 0.9,
              borderRadius: 2,
            }}
          />
        ))
      )}
    </div>
  );
}
