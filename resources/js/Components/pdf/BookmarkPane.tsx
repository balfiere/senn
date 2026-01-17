import { ScrollArea } from '@/Components/ui/scroll-area';

export function BookmarkPane() {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 text-sm text-muted-foreground">No bookmarks in this document.</div>
    </ScrollArea>
  );
}