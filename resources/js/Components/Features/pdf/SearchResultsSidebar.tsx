import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearch } from '@embedpdf/plugin-search/react';
import { MatchFlag } from '@embedpdf/models';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Label } from '@/Components/ui/label';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Search result type from embedpdf
interface SearchResult {
  pageIndex: number;
  context: {
    before: string;
    match: string;
    after: string;
    truncatedLeft?: boolean;
    truncatedRight?: boolean;
  };
  rects: Array<{
    origin: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

interface SearchResultsSidebarProps {
  documentId: string;
  searchQuery: string;
  onClose: () => void;
}

export function SearchResultsSidebar({ documentId, searchQuery, onClose }: SearchResultsSidebarProps) {
  const { state, provides } = useSearch(documentId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { provides: scrollApi } = useScroll(documentId);

  // Group results by page
  const groupedResults = useMemo(() => {
    return state.results.reduce<Record<number, { hit: SearchResult; index: number }[]>>(
      (map, hit, index) => {
        if (!map[hit.pageIndex]) {
          map[hit.pageIndex] = [];
        }
        map[hit.pageIndex].push({ hit: hit as SearchResult, index });
        return map;
      },
      {}
    );
  }, [state.results]);

  const goToResult = useCallback(
    (index: number) => {
      const item = state.results[index];
      if (!item || !scrollApi) return;

      // Calculate min coordinates from all rects
      const minCoordinates = item.rects.reduce(
        (min, rect) => ({
          x: Math.min(min.x, rect.origin.x),
          y: Math.min(min.y, rect.origin.y),
        }),
        { x: Infinity, y: Infinity }
      );

      scrollApi.scrollToPage({
        pageNumber: item.pageIndex + 1,
        pageCoordinates: minCoordinates,
        alignX: 50,
        alignY: 50,
      });

      provides?.goToResult(index);
    },
    [state.results, scrollApi, provides]
  );

  const handleFlagChange = useCallback(
    (flag: MatchFlag, checked: boolean) => {
      if (checked) {
        provides?.setFlags([...state.flags, flag]);
      } else {
        provides?.setFlags(state.flags.filter((f) => f !== flag));
      }
    },
    [provides, state.flags]
  );

  // Scroll active result into view
  useEffect(() => {
    if (state.activeResultIndex >= 0 && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(
        `[data-result-index="${state.activeResultIndex}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [state.activeResultIndex]);

  if (!provides) return null;

  return (
    <div className="flex h-full flex-col" ref={scrollRef}>
      <div className="border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Search Results</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Search options */}
        <div className="space-y-1">
          <Label className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox
              checked={state.flags.includes(MatchFlag.MatchCase)}
              onCheckedChange={(checked) => handleFlagChange(MatchFlag.MatchCase, checked as boolean)}
            />
            <span>Case sensitive</span>
          </Label>
          <Label className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox
              checked={state.flags.includes(MatchFlag.MatchWholeWord)}
              onCheckedChange={(checked) =>
                handleFlagChange(MatchFlag.MatchWholeWord, checked as boolean)
              }
            />
            <span>Whole word</span>
          </Label>
        </div>

        {/* Results count and navigation */}
        {state.active && !state.loading && (
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">
              {state.total} result{state.total !== 1 ? 's' : ''} found
            </span>
            {state.total > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => provides.previousResult()}
                  disabled={state.activeResultIndex <= 0}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs">
                  {state.activeResultIndex + 1} / {state.total}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => provides.nextResult()}
                  disabled={state.activeResultIndex >= state.results.length - 1}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-3">
          {state.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : state.results.length === 0 && searchQuery ? (
            <p className="p-2 text-sm text-muted-foreground">No results found.</p>
          ) : (
            Object.entries(groupedResults).map(([page, hits]) => (
              <div key={page} className="space-y-3">
                <div className="sticky top-0 z-0 border-b border-border/50 bg-background w-full py-2">
                  <h4 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Page {Number(page) + 1}
                  </h4>
                </div>
                <div className="space-y-3">
                  {hits.map(({ hit, index }) => (
                    <button
                      key={index}
                      data-result-index={index}
                      className={cn(
                        'scroll-mt-20 w-full overflow-hidden rounded-none border p-3 text-left shadow-xs transition-all duration-200',
                        index === state.activeResultIndex
                          ? 'border-primary/30 bg-popover'
                          : 'border-border bg-card hover:border-secondary/60'
                      )}
                      onClick={() => goToResult(index)}
                    >
                      <div className="space-y-2">
                        <p
                          className="wrap-break-word text-sm leading-relaxed text-foreground/90"
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          <span className="text-muted-foreground">
                            {hit.context.truncatedLeft && '… '}
                            {hit.context.before}
                          </span>
                          <span className="rounded bg-yellow-200 px-0.5 font-semibold text-foreground dark:bg-yellow-500/30">
                            {hit.context.match}
                          </span>
                          <span className="text-muted-foreground">
                            {hit.context.after}
                            {hit.context.truncatedRight && ' …'}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}