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

  const { provides: searchApi } = useSearch(docId)

  return (
    <DocumentContent documentId={docId}>
      {({ isLoaded }) =>
        isLoaded && (
          <div className="flex flex-col h-full w-full bg-muted/30" style={{ userSelect: "none" }}>
            <AnnotationToolbar
              documentId={docId}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              settings={settings}
              setSettings={setSettings}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              zoom={zoom}
              setZoom={setZoom}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              leftSidebarOpen={leftSidebarOpen}
              setLeftSidebarOpen={setLeftSidebarOpen}
              leftSidebarTab={leftSidebarTab}
              setLeftSidebarTab={setLeftSidebarTab}
              rightSidebarOpen={rightSidebarOpen}
              setRightSidebarOpen={setRightSidebarOpen}
              isMobile={isMobile}
              setRightSidebarTab={setRightSidebarTab}
              rightSidebarTab={rightSidebarTab}
            />

            <div className="flex flex-1 overflow-hidden">
              {leftSidebarOpen && !isMobile && (
                <LeftSidebar
                  documentId={docId}
                  activeTab={leftSidebarTab}
                  setActiveTab={setLeftSidebarTab}
                />
              )}

              <div className="flex-1 relative overflow-hidden">
                <GlobalPointerProvider documentId={docId}>
                  <Viewport
                    documentId={docId}
                    className={cn("absolute inset-0 bg-muted", darkMode && "invert hue-rotate-180")}
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
                                        annotationApi.selectAnnotation(storedAnn.page_number - 1, storedAnn.embedpdf_annotation_id)
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

              {rightSidebarOpen && !isMobile && (
                <div className="w-64 border-l border-border bg-card flex flex-col h-full">
                  <Tabs value={rightSidebarTab} onValueChange={(v) => setRightSidebarTab(v as "comments" | "search")} className="flex flex-col h-full">
                    <TabsList className="w-full rounded-none border-b shrink-0">
                      <TabsTrigger value="comments" className="flex-1 text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Comments
                      </TabsTrigger>
                      <TabsTrigger value="search" className="flex-1 text-xs">
                        <Search className="h-3 w-3 mr-1" />
                        Search
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
}: PdfViewerProps) {
  const { engine, isLoading } = usePdfiumEngine();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState<StoredAnnotation[]>(
    () =>
      initialAnnotations.map((dbAnn) => ({
        ...dbAnn,
        localId: dbAnn.embedpdf_annotation_id,
      })) as StoredAnnotation[],
  );
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<StoredAnnotation | null>(null);
  const [commentTrigger, setCommentTrigger] = useState(0);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'comments' | 'search'>(
    'comments',
  );
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

  // Load annotations from initial data and import them into the viewer
  const loadAnnotations = useCallback(async () => {
    if (!annotationApiRef.current || annotationsLoadedRef.current) {
      return;
    }

    try {
      if (initialAnnotations && initialAnnotations.length > 0) {
        const annotationsToImport: {
          annotation: Record<string, unknown>;
          ctx?: undefined;
        }[] = [];
        for (const dbAnnotation of initialAnnotations) {
          const converted = dbAnnotationToEmbedpdf(dbAnnotation);

          if (
            converted &&
            converted.annotation &&
            converted.annotation.id != null &&
            converted.annotation.pageIndex != null
          ) {
            annotationsToImport.push(converted);
            loadedAnnotationIdsRef.current.add(
              converted.annotation.id as string,
            );
          }
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
      }

      // Mark as loaded
      annotationsLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  }, [initialAnnotations]);

  // Effect to load annotations when document is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnnotations();
    }, 500);

    return () => clearTimeout(timer);
  }, [loadAnnotations, activeDocumentId]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create plugins configuration with the PDF URL
  const plugins = useMemo(
    () => [
      createPluginRegistration(DocumentManagerPluginPackage, {
        initialDocuments: [{ url: pdfUrl }],
      }),
      createPluginRegistration(ViewportPluginPackage),
      createPluginRegistration(ScrollPluginPackage),
      createPluginRegistration(RenderPluginPackage),
      createPluginRegistration(InteractionManagerPluginPackage),
      createPluginRegistration(SelectionPluginPackage),
      createPluginRegistration(HistoryPluginPackage),
      createPluginRegistration(ZoomPluginPackage),
      createPluginRegistration(ThumbnailPluginPackage),
      createPluginRegistration(SearchPluginPackage),
      createPluginRegistration(PanPluginPackage, {
        defaultMode: 'mobile',
      }),
      createPluginRegistration(AnnotationPluginPackage, {
        annotationAuthor: 'User',
        deactivateToolAfterCreate: true,
        selectAfterCreate: true,
      }),
    ],
    [pdfUrl],
  );

  // Helper to prepare annotation data for Inertia (serialize segment_rects)
  const prepareAnnotationPayload = (data: Partial<DbAnnotation>) => {
    const payload: Record<string, string | number | null | undefined> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'segment_rects' && value != null) {
        payload[key] = JSON.stringify(value);
      } else {
        payload[key] = value as string | number | null | undefined;
      }
    }
    return payload;
  };

  // Helper to save annotation to backend
  const saveAnnotation = useCallback(
    async (
      eventType: 'create' | 'update' | 'delete',
      annotationData: Partial<DbAnnotation>,
      annotationId: string,
    ) => {
      try {
        const payload = prepareAnnotationPayload(annotationData);

        switch (eventType) {
          case 'create':
            // Annotation is already added optimistically to local state
            // Just persist to server
            router.post(route('annotations.store', projectId), payload, {
              preserveScroll: true,
              preserveState: true,
              onError: (errors) => {
                console.error('Failed to save annotation:', errors);
              },
            });
            break;

          case 'update':
            router.patch(route('annotations.update', annotationId), payload, {
              preserveScroll: true,
              preserveState: true,
              onSuccess: () => {
                // Update local state
                setAnnotations((prev) =>
                  prev.map((ann) =>
                    ann.embedpdf_annotation_id === annotationId
                      ? ({ ...ann, ...annotationData } as StoredAnnotation)
                      : ann,
                  ),
                );
              },
            });
            break;

          case 'delete':
            // Use fetch for delete operations to avoid Inertia state issues
            const response = await fetch(route('annotations.destroy', annotationId), {
              method: 'DELETE',
              headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
              },
              credentials: 'same-origin',
            });

            if (response.ok) {
              // Update local state on success
              setAnnotations((prev) =>
                prev.filter(
                  (ann) => ann.embedpdf_annotation_id !== annotationId,
                ),
              );
            } else {
              const errorData = await response.json();
              console.error('Failed to delete annotation:', errorData);
            }
            break;
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

              // Optimistically add annotation to local state immediately
              const newStoredAnnotation = {
                ...annotationData,
                id: annotationId, // Use embedpdf ID as temporary ID
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

              // Persist to server
              saveAnnotation('create', annotationData, annotationId);

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
            pdfUrl={pdfUrl}
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
          />
        );
      }}
    </EmbedPDF>
  );
}