import { CommentsSidebar } from './CommentsSidebar';
import type { StoredAnnotation } from './utils';

interface RightSidebarProps {
  annotations: StoredAnnotation[];
  selectedAnnotation: StoredAnnotation | null;
  setSelectedAnnotation: (annotation: StoredAnnotation | null) => void;
  annotationApi: Record<string, unknown> | null;
  commentTrigger?: number;
  documentId: string;
}

export function RightSidebar(props: RightSidebarProps) {
  return <CommentsSidebar {...props} />;
}