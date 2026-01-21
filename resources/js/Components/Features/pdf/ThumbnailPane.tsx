import { ThumbnailsPane, ThumbImg } from '@embedpdf/plugin-thumbnail/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { cn } from '@/lib/utils';

interface ThumbnailPaneProps {
  documentId: string;
}

export function ThumbnailPane({ documentId }: ThumbnailPaneProps) {
  const { state, provides: scroll } = useScroll(documentId);

  return (
    <div className="relative h-full overflow-hidden">
      <ThumbnailsPane documentId={documentId}>
        {(m) => {
          const isActive = state.currentPage === m.pageIndex + 1;
          return (
            <div
              key={m.pageIndex}
              style={{
                position: 'absolute',
                top: m.top,
                height: m.wrapperHeight,
                width: '100%',
              }}
              onClick={() => scroll?.scrollToPage({ pageNumber: m.pageIndex + 1 })}
              className="flex flex-col items-center cursor-pointer px-2"
            >
              {/* Thumbnail image container */}
              <div
                className={cn(
                  'overflow-hidden rounded-sm transition-all',
                  isActive
                    ? 'ring-1 ring-primary/20 ring-offset-2 ring-offset-background'
                    : 'ring-1 ring-border hover:ring-border/80'
                )}
                style={{
                  width: m.width,
                  height: m.height,
                }}
              >
                <ThumbImg
                  documentId={documentId}
                  meta={m}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Page number label */}
              <div
                className="mt-1 flex items-center justify-center"
                style={{ height: m.labelHeight }}
              >
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {m.pageIndex + 1}
                </span>
              </div>
            </div>
          );
        }}
      </ThumbnailsPane>
    </div>
  );
}