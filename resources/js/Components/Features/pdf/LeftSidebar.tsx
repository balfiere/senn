import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ImageIcon, Bookmark, Palette } from 'lucide-react';
import { AnnotationStyleSidebar } from './AnnotationStyleSidebar';
import { ThumbnailPane } from './ThumbnailPane';
import { BookmarkPane } from './BookmarkPane';
import { type AnnotationToolType } from './utils';

interface LeftSidebarProps {
  documentId: string;
  activeTab: 'thumbnails' | 'bookmarks' | 'styles';
  setActiveTab: (tab: 'thumbnails' | 'bookmarks' | 'styles') => void;
  activeTool: AnnotationToolType;
}

export function LeftSidebar({ documentId, activeTab, setActiveTab, activeTool }: LeftSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'thumbnails' | 'bookmarks' | 'styles')}
        className="flex h-full flex-col"
      >
        <TabsList className="w-full shrink-0 rounded-none border-b">
          <TabsTrigger value="thumbnails" className="flex-1 text-xs">
            <ImageIcon className="h-3 w-3" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 text-xs">
            <Bookmark className="h-3 w-3" />
            <span>Bookmarks</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex-1 text-xs">
            <Palette className="h-3 w-3" />
            <span>Styles</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="thumbnails" className="m-0 flex-1 overflow-hidden">
          <ThumbnailPane documentId={documentId} />
        </TabsContent>
        <TabsContent value="bookmarks" className="m-0 flex-1">
          <BookmarkPane />
        </TabsContent>
        <TabsContent value="styles" className="m-0 flex-1">
          <AnnotationStyleSidebar
            documentId={documentId}
            activeTool={activeTool}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}