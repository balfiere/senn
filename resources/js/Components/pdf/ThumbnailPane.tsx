import { ThumbnailsPane, ThumbImg } from '@embedpdf/plugin-thumbnail/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';

interface ThumbnailPaneProps {
  documentId: string;
}

export function ThumbnailPane({ documentId }: ThumbnailPaneProps) {
  const { provides: scroll } = useScroll(documentId);

  return (
    <div className="relative h-full overflow-hidden">
      <ThumbnailsPane documentId={documentId}>
        {(m) => (
          <div
            key={m.pageIndex}
            style={{
              position: 'absolute',
              top: m.top,
              height: m.wrapperHeight,
              width: '100%',
            }}
            onClick={() => scroll?.scrollToPage({ pageNumber: m.pageIndex + 1 })}
            className="flex flex-col items-center cursor-pointer transition-colors hover:bg-muted/50"
          >
            <div style={{ width: m.width, height: m.height }}>
              <ThumbImg documentId={documentId} meta={m} />
            </div>
            <div className="mt-1 text-center text-xs text-muted-foreground">
              {m.pageIndex + 1}
            </div>
          </div>
        )}
      </ThumbnailsPane>
    </div>
  );
}