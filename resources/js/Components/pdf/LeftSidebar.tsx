import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { ImageIcon, Bookmark, Palette } from 'lucide-react';
import { ThumbnailsPane, ThumbImg } from '@embedpdf/plugin-thumbnail/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { AnnotationStyleSidebar } from './AnnotationStyleSidebar';
import { type AnnotationToolType } from './utils';

interface LeftSidebarProps {
  documentId: string;
  activeTab: 'thumbnails' | 'bookmarks' | 'styles';
  setActiveTab: (tab: 'thumbnails' | 'bookmarks' | 'styles') => void;
  activeTool: AnnotationToolType;
}

export function LeftSidebar({ documentId, activeTab, setActiveTab, activeTool }: LeftSidebarProps) {
  const { provides: scroll } = useScroll(documentId);

  return (
    <div className="flex h-full w-48 flex-col border-r border-border bg-card">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'thumbnails' | 'bookmarks' | 'styles')}
        className="flex h-full flex-col"
      >
        <TabsList className="w-full shrink-0 rounded-none border-b">
          <TabsTrigger value="thumbnails" className="flex-1 text-xs">
            <ImageIcon className="mr-1 h-3 w-3" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 text-xs">
            <Bookmark className="mr-1 h-3 w-3" />
            Bookmarks
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex-1 text-xs">
            <Palette className="mr-1 h-3 w-3" />
            Styles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="thumbnails" className="m-0 flex-1 overflow-hidden">
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
                  className="cursor-pointer transition-colors hover:bg-muted/50"
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
        </TabsContent>
        <TabsContent value="bookmarks" className="m-0 flex-1">
          <ScrollArea className="h-full">
            <div className="p-3 text-sm text-muted-foreground">No bookmarks in this document.</div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="styles" className="m-0 flex-1">
          <AnnotationStyleSidebar documentId={documentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}