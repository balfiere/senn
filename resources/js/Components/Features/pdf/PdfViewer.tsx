import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import { PdfBlendMode } from '@embedpdf/models';
import {
  AnnotationPlugin,
  AnnotationPluginPackage,
} from '@embedpdf/plugin-annotation';
import { AnnotationLayer } from '@embedpdf/plugin-annotation/react';
import { DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager';
import { DocumentContent } from '@embedpdf/plugin-document-manager/react';
import { HistoryPluginPackage } from '@embedpdf/plugin-history';
import { InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager';
import {
  GlobalPointerProvider,
  PagePointerProvider,
} from '@embedpdf/plugin-interaction-manager/react';
import { PanPluginPackage } from '@embedpdf/plugin-pan/react';
import { RenderPluginPackage } from '@embedpdf/plugin-render';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { ScrollPluginPackage } from '@embedpdf/plugin-scroll';
import { Scroller } from '@embedpdf/plugin-scroll/react';
import { SearchPluginPackage } from '@embedpdf/plugin-search';
import { useSearch } from '@embedpdf/plugin-search/react';
import { SelectionPluginPackage } from '@embedpdf/plugin-selection';
import { SelectionLayer } from '@embedpdf/plugin-selection/react';
import { ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail';
import { ViewportPluginPackage } from '@embedpdf/plugin-viewport';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { ZoomPluginPackage } from '@embedpdf/plugin-zoom';
import { router } from '@inertiajs/react';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquare, Search } from 'lucide-react';

import { usePdfLoader } from '@/hooks/use-pdf-loader';
import type { LocalPdfAnnotation } from '@/lib/offline/db';
import {
  deleteAnnotationLocally,
  upsertAnnotationLocally,
} from '@/lib/offline/repositories/pdf-annotations';
import { AnnotationSelectionMenu } from './AnnotationSelectionMenu';
import { AnnotationToolbar } from './AnnotationToolbar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { SearchLayer } from './SearchLayer';
import { SearchResultsSidebar } from './SearchResultsSidebar';
import { TextSelectionMenu } from './TextSelectionMenu';
import {
  ANNOTATION_COLORS,
  annotationToDbFormat,
  dbAnnotationToEmbedpdf,
  type AnnotationSettings,
  type AnnotationToolType,
  type DbAnnotation,
  type StoredAnnotation,
} from './utils';

interface PdfViewerProps {
  pdfUrl: string;
  projectId: string;
  initialAnnotations?: DbAnnotation[];
  projectUpdatedAt: string;
}

interface PdfViewerContentProps {
  documentId: string;
  projectId: string;
  pdfUrl: string;
  annotations: StoredAnnotation[];
  selectedAnnotation: StoredAnnotation | null;
  setSelectedAnnotation: (annotation: StoredAnnotation | null) => void;
  isMobile: boolean;
  onDocumentIdChange: (documentId: string) => void;
  annotationApi: Record<string, unknown> | null;
  commentTrigger: number;
  setCommentTrigger: Dispatch<SetStateAction<number>>;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: Dispatch<SetStateAction<boolean>>;
  rightSidebarTab: 'comments' | 'search';
  setRightSidebarTab: Dispatch<SetStateAction<'comments' | 'search'>>;
  searchBarHidden: boolean;
  setSearchBarHidden: (hidden: boolean) => void;
}

function PdfViewerContent({
  documentId: docId,
  projectId,
  annotations,
  selectedAnnotation,
  setSelectedAnnotation,
  isMobile,
  onDocumentIdChange,
  annotationApi,
  commentTrigger,
  setCommentTrigger,
  rightSidebarOpen,
  setRightSidebarOpen,
  rightSidebarTab,
  setRightSidebarTab,
  searchBarHidden,
  setSearchBarHidden,
}: PdfViewerContentProps) {
  useEffect(() => {
    onDocumentIdChange(docId)
  }, [docId, onDocumentIdChange])

  const [activeTool, setActiveTool] = useState<AnnotationToolType>("select")
  const [settings, setSettings] = useState<AnnotationSettings>({
    color: ANNOTATION_COLORS[3].value, // Mauve
    opacity: 0.5,
    blendMode: PdfBlendMode.Multiply,
    fontSize: 14,
    strokeWidth: 2,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [zoom, setZoom] = useState(100)
  const [darkMode, setDarkMode] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [leftSidebarTab, setLeftSidebarTab] = useState<"thumbnails" | "bookmarks" | "styles">("thumbnails")

  const handleSetLeftSidebarOpen = (open: boolean) => {
    if (isMobile && open) {
      setRightSidebarOpen(false);
    }
    setLeftSidebarOpen(open);
  };

  const handleSetRightSidebarOpen = (open: boolean) => {
    if (isMobile && open) {
      setLeftSidebarOpen(false);
    }
    setRightSidebarOpen(open);
  };

  const closeSidebars = () => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  };

  const { provides: searchApi } = useSearch(docId);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!searchApi) return;

    const api = searchApi as unknown as Record<string, unknown>;
    const trimmed = query.trim();

    if (trimmed) {
      if (typeof api.setShowAllResults === 'function') {
        api.setShowAllResults(true);
      }
      if (typeof api.searchAllPages === 'function') {
        api.searchAllPages(trimmed);
      } else if (typeof api.startSearch === 'function') {
        api.startSearch(trimmed);
      }
    } else {
      if (typeof api.stopSearch === 'function') {
        api.stopSearch();
      }
    }
  };

  return (
    <DocumentContent documentId={docId}>
      {({ isLoaded }) =>
        isLoaded && (
          <div className="flex flex-col h-full w-full" style={{ userSelect: "none" }}>
            <AnnotationToolbar
              documentId={docId}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              settings={settings}
              setSettings={setSettings}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              zoom={zoom}
              setZoom={setZoom}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              leftSidebarOpen={leftSidebarOpen}
              setLeftSidebarOpen={handleSetLeftSidebarOpen}
              leftSidebarTab={leftSidebarTab}
              setLeftSidebarTab={setLeftSidebarTab}
              rightSidebarOpen={rightSidebarOpen}
              setRightSidebarOpen={handleSetRightSidebarOpen}
              isMobile={isMobile}
              setRightSidebarTab={setRightSidebarTab}
              rightSidebarTab={rightSidebarTab}
              onSearchBarVisibilityChange={setSearchBarHidden}
              closeSidebars={isMobile ? closeSidebars : undefined}
            />

            <div className="flex flex-1 overflow-hidden relative">
              {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
                <div
                  className="absolute inset-0 z-10 bg-black/5"
                  onClick={closeSidebars}
                />
              )}

              {leftSidebarOpen && (
                <div
                  className={cn(
                    "border-r border-border bg-background flex flex-col",
                    isMobile ? "absolute left-0 top-0 bottom-[53px] z-20 w-64 shadow-xl h-[calc(100%-53px)]" : "w-48 h-full"
                  )}
                >
                  <LeftSidebar
                    documentId={docId}
                    activeTab={leftSidebarTab}
                    setActiveTab={setLeftSidebarTab}
                    activeTool={activeTool}
                  />
                </div>
              )}

              <div className="flex-1 relative overflow-hidden">
                <GlobalPointerProvider documentId={docId}>
                  <Viewport
                    documentId={docId}
                    className={cn("absolute inset-0", darkMode && "invert hue-rotate-180")}
                  >
                    <Scroller
                      documentId={docId}
                      renderPage={({ pageIndex }) => (
                        <PagePointerProvider documentId={docId} pageIndex={pageIndex}>
                          <RenderLayer
                            documentId={docId}
                            pageIndex={pageIndex}
                            style={{ pointerEvents: "none" }}
                          />
                          <SearchLayer documentId={docId} pageIndex={pageIndex} />
                          <SelectionLayer
                            documentId={docId}
                            pageIndex={pageIndex}
                            selectionMenu={(props) => (
                              <TextSelectionMenu
                                {...props}
                                documentId={docId}
                              />
                            )}
                          />
                          <AnnotationLayer
                            documentId={docId}
                            pageIndex={pageIndex}
                            selectionMenu={(props) => (
                              <AnnotationSelectionMenu
                                {...props}
                                documentId={docId}
                                onOpenComment={(annotation) => {
                                  if (annotation) {
                                    const storedAnn = annotations.find(a => a.embedpdf_annotation_id === annotation.id)
                                    if (storedAnn) {
                                      setSelectedAnnotation(storedAnn)
                                      if (annotationApi) {
                                        (annotationApi as any).selectAnnotation(storedAnn.page_number - 1, storedAnn.embedpdf_annotation_id)
                                      }
                                    }
                                  }
                                  setRightSidebarOpen(true)
                                  setRightSidebarTab("comments")
                                  setCommentTrigger(prev => prev + 1)
                                }}
                              />
                            )}
                          />
                        </PagePointerProvider>
                      )}
                    />
                  </Viewport>
                </GlobalPointerProvider>
              </div>

              {rightSidebarOpen && (
                <div
                  className={cn(
                    "border-l border-border bg-background flex flex-col",
                    isMobile ? "absolute right-0 top-0 bottom-[53px] z-20 w-72 shadow-xl h-[calc(100%-53px)]" : "w-64 h-full"
                  )}
                >
                  <Tabs value={rightSidebarTab} onValueChange={(v) => setRightSidebarTab(v as "comments" | "search")} className="flex flex-col h-full">
                    <TabsList className="w-full rounded-none border-b shrink-0">
                      <TabsTrigger value="comments" className="flex-1 text-xs">
                        <MessageSquare className="h-3 w-3" />
                        <span>Comments</span>
                      </TabsTrigger>
                      <TabsTrigger value="search" className="flex-1 text-xs">
                        <Search className="h-3 w-3" />
                        <span>Search</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="comments" className="flex-1 m-0 overflow-hidden">
                      <RightSidebar
                        annotations={annotations}
                        selectedAnnotation={selectedAnnotation}
                        setSelectedAnnotation={setSelectedAnnotation}
                        annotationApi={annotationApi}
                        commentTrigger={commentTrigger}
                        documentId={docId}
                      />
                    </TabsContent>
                    <TabsContent value="search" className="flex-1 m-0 overflow-hidden">
                      <SearchResultsSidebar
                        documentId={docId}
                        searchQuery={searchQuery}
                        onClose={() => {
                          setRightSidebarOpen(false)
                          setSearchQuery("")
                          searchApi?.stopSearch()
                        }}
                        showIntegratedSearch={searchBarHidden}
                        onSearch={handleSearch}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        )
      }
    </DocumentContent>
  )
}

export function PdfViewer({
  pdfUrl,
  projectId,
  initialAnnotations = [],
  projectUpdatedAt,
}: PdfViewerProps) {
  const { pdfBlobUrl, isLoading: isPdfLoading, error: pdfError } = usePdfLoader(projectId, pdfUrl, projectUpdatedAt);
  const { engine, isLoading } = usePdfiumEngine();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState<StoredAnnotation[]>(
    () =>
      initialAnnotations.map((dbAnn) => ({
        ...dbAnn,
        localId: dbAnn.embedpdf_annotation_id,
        text_align: dbAnn.text_align ?? 0,
        vertical_align: dbAnn.vertical_align ?? 0,
      })) as StoredAnnotation[],
  );
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<StoredAnnotation | null>(null);
  const [commentTrigger, setCommentTrigger] = useState(0);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'comments' | 'search'>(
    'comments',
  );
  const [searchBarHidden, setSearchBarHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs to store API and state for use in event handlers
  const annotationApiRef = useRef<Record<string, unknown> | null>(null);
  const rightSidebarOpenRef = useRef(rightSidebarOpen);
  const rightSidebarTabRef = useRef(rightSidebarTab);
  const annotationsRef = useRef(annotations);
  const annotationsLoadedRef = useRef(false);
  const loadedAnnotationIdsRef = useRef<Set<string>>(new Set());

  // Keep refs in sync with state
  useEffect(() => {
    rightSidebarOpenRef.current = rightSidebarOpen;
  }, [rightSidebarOpen]);

  useEffect(() => {
    rightSidebarTabRef.current = rightSidebarTab;
  }, [rightSidebarTab]);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  // Synchronize annotations to the engine - only imports annotations not already loaded
  // This prevents duplicate imports and race conditions when views change
  const syncAnnotationsToEngine = useCallback(async () => {
    if (!annotationApiRef.current) {
      return;
    }

    try {
      // Use annotationsRef.current as the single source of truth
      // It's already initialized from initialAnnotations and updated with new annotations
      const currentAnnotations = annotationsRef.current;

      const annotationsToImport: {
        annotation: Record<string, unknown>;
        ctx?: undefined;
      }[] = [];

      for (const dbAnnotation of currentAnnotations) {
        const annotationId = dbAnnotation.embedpdf_annotation_id;

        // Skip annotations that are already loaded in the engine
        // This prevents duplicate imports and the resulting duplicate create events
        if (loadedAnnotationIdsRef.current.has(annotationId)) {
          continue;
        }

        const converted = dbAnnotationToEmbedpdf(dbAnnotation);
        if (!converted) {
          continue;
        }

        // Mark as loaded BEFORE importing to prevent race conditions
        loadedAnnotationIdsRef.current.add(annotationId);

        annotationsToImport.push({
          annotation: converted,
        });
      }

      if (annotationsToImport.length > 0) {
        const api = annotationApiRef.current as {
          importAnnotations: (
            annotations: {
              annotation: Record<string, unknown>;
              ctx?: undefined;
            }[],
          ) => void;
        };
        api.importAnnotations(annotationsToImport);
      }
    } catch (error) {
      console.error('Error syncing annotations to engine:', error);
    }
  }, []);

  // Effect to sync annotations when document is loaded and engine is ready
  useEffect(() => {
    if (activeDocumentId && annotationApiRef.current) {
      // Small delay to ensure the engine is ready
      const timer = setTimeout(() => {
        syncAnnotationsToEngine();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [activeDocumentId, syncAnnotationsToEngine]);


  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 880);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Create plugins configuration with the PDF URL
  const plugins = useMemo(
    () => {
      if (!pdfBlobUrl) return [];

      return [
        createPluginRegistration(DocumentManagerPluginPackage, {
          initialDocuments: [{ url: pdfBlobUrl }],
        }),
        createPluginRegistration(ViewportPluginPackage),
        createPluginRegistration(ScrollPluginPackage),
        createPluginRegistration(RenderPluginPackage),
        createPluginRegistration(InteractionManagerPluginPackage),
        createPluginRegistration(SelectionPluginPackage),
        createPluginRegistration(HistoryPluginPackage),
        createPluginRegistration(ZoomPluginPackage),
        createPluginRegistration(ThumbnailPluginPackage, {
          width: 120,
          paddingY: 10,
        }),
        createPluginRegistration(SearchPluginPackage),
        createPluginRegistration(PanPluginPackage, {
          defaultMode: 'mobile',
        }),
        createPluginRegistration(AnnotationPluginPackage, {
          annotationAuthor: 'User',
          deactivateToolAfterCreate: true,
          selectAfterCreate: true,
        }),
      ];
    },
    [pdfBlobUrl],
  );

  /**
   * Persist an annotation change to the local IndexedDB and queue a sync event.
   * The sync engine will push it to the server when online.
   *
   * @param eventType - 'create' | 'update' | 'delete'
   * @param annotationData - Partial annotation fields from the EmbedPDF engine event
   * @param annotationId - The EmbedPDF engine annotation ID (embedpdf_annotation_id)
   * @param dbId - Pre-generated DB row UUID (only used for 'create')
   */
  const saveAnnotation = useCallback(
    async (
      eventType: 'create' | 'update' | 'delete',
      annotationData: Partial<DbAnnotation>,
      annotationId: string,
      dbId?: string,
    ) => {
      try {
        const now = new Date().toISOString();

        switch (eventType) {
          case 'create': {
            const resolvedDbId = dbId ?? crypto.randomUUID();
            const localAnnotation: LocalPdfAnnotation = {
              id: resolvedDbId,
              project_id: annotationData.project_id ?? projectId,
              embedpdf_annotation_id: annotationData.embedpdf_annotation_id ?? annotationId,
              page_number: annotationData.page_number ?? 1,
              annotation_type: annotationData.annotation_type ?? 'unknown',
              position_x: annotationData.position_x ?? 0,
              position_y: annotationData.position_y ?? 0,
              width: annotationData.width ?? 0,
              height: annotationData.height ?? 0,
              color: annotationData.color ?? null,
              fill_color: annotationData.fill_color ?? null,
              stroke_color: annotationData.stroke_color ?? null,
              opacity: annotationData.opacity ?? 1,
              blend_mode: annotationData.blend_mode ?? 0,
              stroke_width: annotationData.stroke_width ?? 1,
              font_size: annotationData.font_size ?? 14,
              font_family: annotationData.font_family ?? null,
              line_start_x: annotationData.line_start_x ?? null,
              line_start_y: annotationData.line_start_y ?? null,
              line_end_x: annotationData.line_end_x ?? null,
              line_end_y: annotationData.line_end_y ?? null,
              line_ending: annotationData.line_ending ?? null,
              line_start_ending: annotationData.line_start_ending ?? null,
              line_end_ending: annotationData.line_end_ending ?? null,
              contents: annotationData.contents ?? null,
              comment: annotationData.comment ?? null,
              in_reply_to_id: annotationData.in_reply_to_id ?? null,
              segment_rects: annotationData.segment_rects ?? null,
              text_align: annotationData.text_align ?? 0,
              vertical_align: annotationData.vertical_align ?? 0,
              created_at: now,
              updated_at: now,
              deleted_at: null,
            };
            await upsertAnnotationLocally(localAnnotation);

            // Update state: replace the temp embedpdf id used as id with the real DB UUID
            setAnnotations((prev) =>
              prev.map((ann) =>
                ann.embedpdf_annotation_id === annotationId
                  ? { ...ann, id: resolvedDbId }
                  : ann,
              ),
            );
            break;
          }

          case 'update': {
            const existing = annotationsRef.current.find(
              (ann) => ann.embedpdf_annotation_id === annotationId,
            );
            if (!existing) {
              console.warn('[PDF Annotation] Cannot update: not found in state', annotationId);
              return;
            }
            const localAnnotation: LocalPdfAnnotation = {
              id: existing.id,
              project_id: annotationData.project_id ?? projectId,
              embedpdf_annotation_id: annotationId,
              page_number: annotationData.page_number ?? existing.page_number,
              annotation_type: annotationData.annotation_type ?? existing.annotation_type,
              position_x: annotationData.position_x ?? existing.position_x,
              position_y: annotationData.position_y ?? existing.position_y,
              width: annotationData.width ?? existing.width,
              height: annotationData.height ?? existing.height,
              color: annotationData.color !== undefined ? annotationData.color : existing.color,
              fill_color: annotationData.fill_color !== undefined ? annotationData.fill_color : existing.fill_color,
              stroke_color: annotationData.stroke_color !== undefined ? annotationData.stroke_color : existing.stroke_color,
              opacity: annotationData.opacity ?? existing.opacity,
              blend_mode: annotationData.blend_mode ?? existing.blend_mode,
              stroke_width: annotationData.stroke_width ?? existing.stroke_width,
              font_size: annotationData.font_size ?? existing.font_size,
              font_family: annotationData.font_family !== undefined ? annotationData.font_family : existing.font_family,
              line_start_x: annotationData.line_start_x !== undefined ? annotationData.line_start_x : existing.line_start_x,
              line_start_y: annotationData.line_start_y !== undefined ? annotationData.line_start_y : existing.line_start_y,
              line_end_x: annotationData.line_end_x !== undefined ? annotationData.line_end_x : existing.line_end_x,
              line_end_y: annotationData.line_end_y !== undefined ? annotationData.line_end_y : existing.line_end_y,
              line_ending: annotationData.line_ending !== undefined ? annotationData.line_ending : existing.line_ending,
              line_start_ending: annotationData.line_start_ending !== undefined ? annotationData.line_start_ending : existing.line_start_ending,
              line_end_ending: annotationData.line_end_ending !== undefined ? annotationData.line_end_ending : existing.line_end_ending,
              contents: annotationData.contents !== undefined ? annotationData.contents : existing.contents,
              comment: annotationData.comment !== undefined ? annotationData.comment : existing.comment,
              in_reply_to_id: annotationData.in_reply_to_id !== undefined ? annotationData.in_reply_to_id : existing.in_reply_to_id,
              segment_rects: annotationData.segment_rects !== undefined ? annotationData.segment_rects : existing.segment_rects,
              text_align: annotationData.text_align ?? existing.text_align,
              vertical_align: annotationData.vertical_align ?? existing.vertical_align,
              created_at: existing.created_at,
              updated_at: now,
              deleted_at: null,
            };
            await upsertAnnotationLocally(localAnnotation);

            // Update React state to reflect the change
            setAnnotations((prev) =>
              prev.map((ann) =>
                ann.embedpdf_annotation_id === annotationId
                  ? ({ ...ann, ...annotationData, updated_at: now } as StoredAnnotation)
                  : ann,
              ),
            );
            break;
          }

          case 'delete': {
            const existing = annotationsRef.current.find(
              (ann) => ann.embedpdf_annotation_id === annotationId,
            );
            if (existing?.id) {
              await deleteAnnotationLocally(existing.id);
            }
            // State filter is handled in the calling event handler
            break;
          }
        }
      } catch (error) {
        console.error('Annotation save error:', error);
      }
    },
    [projectId],
  );

  if (isLoading || !engine) {
    return (
      <div className="bg-muted/30 flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading PDF Engine...</span>
        </div>
      </div>
    );
  }

  if (isPdfLoading) {
    return (
      <div className="bg-muted/30 flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading PDF...</span>
        </div>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="bg-muted/30 flex h-full w-full items-center justify-center">
        <div className="text-destructive flex items-center gap-2">
          <span className="text-sm">Error loading PDF: {pdfError.message}</span>
        </div>
      </div>
    );
  }

  return (
    <EmbedPDF
      engine={engine}
      plugins={plugins}
      onInitialized={async (registry) => {
        const annotationPlugin = registry.getPlugin<AnnotationPlugin>(
          AnnotationPlugin.id,
        );
        const annotationApi = annotationPlugin?.provides();

        if (!annotationApi) return;

        annotationApiRef.current = annotationApi as unknown as Record<
          string,
          unknown
        >;

        // CRITICAL: Clear loadedAnnotationIdsRef when engine re-initializes
        // The engine state is reset on re-init, so annotations need to be re-imported
        // This ensures newly created annotations are properly restored after view changes
        loadedAnnotationIdsRef.current.clear();

        // Set default colors and blend modes for annotation tools
        annotationApi.setToolDefaults('highlight', {
          color:
            ANNOTATION_COLORS.find((c) => c.name === 'Yellow')?.value ||
            '#f9e2af',
          blendMode: PdfBlendMode.Multiply,
        });
        annotationApi.setToolDefaults('underline', {
          color:
            ANNOTATION_COLORS.find((c) => c.name === 'Lavender')?.value ||
            '#b4befe',
          blendMode: PdfBlendMode.Multiply,
        });
        annotationApi.setToolDefaults('line', {
          strokeColor:
            ANNOTATION_COLORS.find((c) => c.name === 'Blue')?.value ||
            '#89b4fa',
        });
        annotationApi.setToolDefaults('lineArrow', {
          strokeColor:
            ANNOTATION_COLORS.find((c) => c.name === 'Maroon')?.value ||
            '#eba0ac',
        });
        annotationApi.setToolDefaults('square', {
          strokeColor:
            ANNOTATION_COLORS.find((c) => c.name === 'Teal')?.value ||
            '#94e2d5',
        });
        annotationApi.setToolDefaults('freeText', {
          fontColor:
            ANNOTATION_COLORS.find((c) => c.name === 'Black')?.value ||
            '#1e1e2e',
        });

        // Subscribe to annotation events for saving to database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        annotationApi.onAnnotationEvent(async (event: any) => {
          // Enhanced logging for debugging arrow annotations
          const ann = event.annotation || event;
          const obj = ann?.object || ann;

          if (
            obj?.type === 'lineArrow' ||
            obj?.annotationType === 'lineArrow' ||
            obj?.type === 7 ||
            obj?.annotationType === 7
          ) {
            // 7 is typically LineArrow in EmbedPDF
            console.log('[PDF Annotation Event - Arrow Debug]', {
              eventType: event.type,
              committed: event.committed,
              fullAnnotation: ann,
              lineEndings: obj.lineEndings,
              lineEndStarting: obj.lineEndStarting,
              lineEndEnding: obj.lineEndEnding,
              lineStartEnding: obj.lineStartEnding,
              allProperties: Object.keys(obj),
              rawObject: obj,
            });
          }

          console.log('[PDF Annotation Event]', event.type, {
            committed: event.committed,
            annotation: event.annotation,
            pageIndex: event.pageIndex,
          });

          if (event.type === 'loaded') return;

          const annotation = event.annotation || event;
          if (!annotation) {
            console.log(
              '[PDF Annotation Event] No annotation in event, skipping',
            );
            return;
          }

          // For create events, only process when committed (finalized)
          // For update events, process all (they don't always have committed flag)
          if (event.type === 'create' && !event.committed) {
            console.log(
              '[PDF Annotation Event] Skipping uncommitted create event',
            );
            return;
          }

          const annotationObj = annotation.object
            ? annotation.object
            : annotation;
          const annotationId =
            annotation.id || annotationObj?.id || annotation.object?.id;
          const pageIndex =
            event.pageIndex ?? annotation.pageIndex ?? annotationObj?.pageIndex;

          if (!annotationId) return;

          if (
            loadedAnnotationIdsRef.current.has(annotationId) &&
            event.type === 'create'
          ) {
            return;
          }

          const annotationData = annotationToDbFormat(
            annotation,
            projectId,
            pageIndex,
          );

          switch (event.type) {
            case 'create':
              console.log('[PDF Annotation] Creating annotation:', {
                annotationId,
                pageIndex,
                annotationData,
              });

              // Generate a stable DB UUID upfront so the state and IndexedDB share the same id
              const dbId = crypto.randomUUID();

              // Optimistically add annotation to local state immediately
              const newStoredAnnotation = {
                ...annotationData,
                id: dbId, // DB row UUID (not the embedpdf engine id)
                localId: annotationData.embedpdf_annotation_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as StoredAnnotation;

              console.log(
                '[PDF Annotation] Adding to state:',
                newStoredAnnotation,
              );
              setAnnotations((prev) => {
                console.log(
                  '[PDF Annotation] Previous annotations count:',
                  prev.length,
                );
                return [...prev, newStoredAnnotation];
              });

              // CRITICAL FIX: Immediately add the new annotation ID to loadedAnnotationIdsRef
              // This prevents the annotation from being lost during view changes/re-initialization
              loadedAnnotationIdsRef.current.add(annotationId);

              // Persist to IndexedDB and queue sync event
              saveAnnotation('create', annotationData, annotationId, dbId);

              // If the sidebar is open to comments, auto-select the new annotation
              if (
                rightSidebarOpenRef.current &&
                rightSidebarTabRef.current === 'comments'
              ) {
                setTimeout(() => {
                  setSelectedAnnotation(newStoredAnnotation);
                }, 100);
              }
              break;

            case 'update':
              let updatedAnnotation = annotation;
              if (event.patch) {
                updatedAnnotation = JSON.parse(JSON.stringify(annotation));
                Object.assign(updatedAnnotation, event.patch);
                if (event.patch.object && updatedAnnotation.object) {
                  Object.assign(updatedAnnotation.object, event.patch.object);
                }
              }

              const updatedAnnotationData = annotationToDbFormat(
                updatedAnnotation,
                projectId,
                pageIndex,
              );
              saveAnnotation('update', updatedAnnotationData, annotationId);
              break;

            case 'delete':
              // For delete events, use the annotation ID from the event
              const deleteAnnotationId = annotation.id || annotation.object?.id;
              if (deleteAnnotationId) {
                saveAnnotation('delete', {}, deleteAnnotationId);

                // Remove from tracking ref so it can be re-created if needed
                loadedAnnotationIdsRef.current.delete(deleteAnnotationId);

                // Remove from local state immediately
                setAnnotations((prev) =>
                  prev.filter(
                    (ann) => ann.embedpdf_annotation_id !== deleteAnnotationId,
                  ),
                );
              }
              break;
          }
        });
      }}
    >
      {({ activeDocumentId: docId }) => {
        if (!docId) return null;

        return (
          <PdfViewerContent
            documentId={docId}
            onDocumentIdChange={setActiveDocumentId}
            projectId={projectId}

            pdfUrl={pdfBlobUrl!}
            annotations={annotations}
            selectedAnnotation={selectedAnnotation}
            setSelectedAnnotation={(ann) => {
              setSelectedAnnotation(ann);
              if (ann && annotationApiRef.current) {
                const api = annotationApiRef.current as {
                  selectAnnotation: (pageIndex: number, id: string) => void;
                };
                api.selectAnnotation(
                  ann.page_number - 1,
                  ann.embedpdf_annotation_id,
                );
              }
            }}
            annotationApi={annotationApiRef.current}
            commentTrigger={commentTrigger}
            setCommentTrigger={setCommentTrigger}
            rightSidebarOpen={rightSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
            rightSidebarTab={rightSidebarTab}
            setRightSidebarTab={setRightSidebarTab}
            isMobile={isMobile}
            searchBarHidden={searchBarHidden}
            setSearchBarHidden={setSearchBarHidden}
          />
        );
      }}
    </EmbedPDF>
  );
}