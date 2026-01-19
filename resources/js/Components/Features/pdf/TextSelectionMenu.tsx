import { Separator } from '@/Components/ui/separator';
import { PdfAnnotationSubtype } from '@embedpdf/models';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { Highlighter, Underline } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { ANNOTATION_COLORS } from './utils';

interface TextSelectionMenuProps {
  documentId: string;
  menuWrapperProps: React.HTMLAttributes<HTMLDivElement>;
  rect: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  placement: {
    suggestTop?: boolean;
  };
}

export function TextSelectionMenu({
  documentId,
  menuWrapperProps,
  rect,
  placement,
}: TextSelectionMenuProps) {
  const { provides: selectionCapability } = useSelectionCapability();
  const { provides: annotationCapability } = useAnnotationCapability();
  const selectionScope = selectionCapability?.forDocument(documentId);
  const annotationScope = annotationCapability?.forDocument(documentId);

  const handleCopy = useCallback(() => {
    if (!selectionScope) return;
    selectionScope.copyToClipboard();
    selectionScope.clear();
  }, [selectionScope]);

  const handleHighlight = useCallback(async () => {
    if (!selectionScope || !annotationScope) return;

    try {
      // Get the formatted selection data
      const task = selectionScope.getFormattedSelection();
      const formattedSelection = await task;

      if (formattedSelection && formattedSelection.length > 0) {
        // Create highlight annotations for each selection range
        for (const selection of formattedSelection) {
          if (selection.segmentRects && selection.segmentRects.length > 0) {
            // Use the first rect as the main annotation rect
            const firstRect = selection.segmentRects[0];
            const annotationRect = {
              origin: { x: firstRect.origin.x, y: firstRect.origin.y },
              size: {
                width: firstRect.size.width,
                height: firstRect.size.height,
              },
            };

            // Create the highlight annotation using importAnnotations
            const highlightAnnotation = {
              pageIndex: selection.pageIndex,
              id: `highlight-${Date.now()}-${Math.random()}`,
              type: PdfAnnotationSubtype.HIGHLIGHT,
              rect: annotationRect,
              segmentRects: selection.segmentRects,
              color: ANNOTATION_COLORS.find((color) => color.name === 'Yellow')
                ?.value,
              opacity: 0.5,
            };

            await annotationScope.importAnnotations([
              {
                annotation: highlightAnnotation as unknown as Parameters<
                  typeof annotationScope.importAnnotations
                >[0][0]['annotation'],
                ctx: undefined,
              },
            ]);

            // Commit the changes to make annotations visible
            await annotationScope.commit();
          }
        }
      }

      // Clear the selection
      selectionScope.clear();
    } catch (error) {
      console.error('Failed to create highlight annotation:', error);
    }
  }, [selectionScope, annotationScope]);

  const handleUnderline = useCallback(async () => {
    if (!selectionScope || !annotationScope) return;

    try {
      // Get the formatted selection data
      const task = selectionScope.getFormattedSelection();
      const formattedSelection = await task;

      if (formattedSelection && formattedSelection.length > 0) {
        // Create underline annotations for each selection range
        for (const selection of formattedSelection) {
          if (selection.segmentRects && selection.segmentRects.length > 0) {
            // Use the first rect as the main annotation rect
            const firstRect = selection.segmentRects[0];
            const annotationRect = {
              origin: { x: firstRect.origin.x, y: firstRect.origin.y },
              size: {
                width: firstRect.size.width,
                height: firstRect.size.height,
              },
            };

            // Create the underline annotation using importAnnotations
            const underlineAnnotation = {
              pageIndex: selection.pageIndex,
              id: `underline-${Date.now()}-${Math.random()}`,
              type: PdfAnnotationSubtype.UNDERLINE,
              rect: annotationRect,
              segmentRects: selection.segmentRects,
              color: ANNOTATION_COLORS.find((color) => color.name === 'Sky')
                ?.value,
              opacity: 0.8,
            };

            await annotationScope.importAnnotations([
              {
                annotation: underlineAnnotation as unknown as Parameters<
                  typeof annotationScope.importAnnotations
                >[0][0]['annotation'],
                ctx: undefined,
              },
            ]);

            // Commit the changes to make annotations visible
            await annotationScope.commit();
          }
        }
      }

      // Clear the selection
      selectionScope.clear();
    } catch (error) {
      console.error('Failed to create underline annotation:', error);
    }
  }, [selectionScope, annotationScope]);

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'auto',
    cursor: 'default',
    top: placement?.suggestTop ? '-48px' : `${rect.size.height + 8}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
  };

  return (
    <div {...menuWrapperProps}>
      <div
        style={menuStyle}
        className="border-border bg-card rounded-lg border shadow-lg"
      >
        <div className="flex items-center gap-1 px-2 py-1.5">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center rounded p-1.5 transition-colors"
            title="Copy text"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Highlight button */}
          <button
            onClick={handleHighlight}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center rounded p-1.5 transition-colors"
            title="Highlight text"
          >
            <Highlighter size={16} />
          </button>

          {/* Underline button */}
          <button
            onClick={handleUnderline}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center rounded p-1.5 transition-colors"
            title="Underline text"
          >
            <Underline size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
