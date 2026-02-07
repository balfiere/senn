import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { CounterCard } from '@/Components/Features/Counter/CounterCard';
import { PdfViewer } from '@/Components/Features/pdf/PdfViewer';
import { ProjectSidebar } from '@/Components/ProjectSidebar';
import { ResponsiveToaster } from '@/Components/Features/ResponsiveToaster';
import { useProjectViewState } from '@/hooks/useProjectViewState';
import { useStopwatch } from '@/hooks/useStopwatch';
import { Part, PdfAnnotation, Project } from '@/types';
import { useProjectData } from '@/hooks/use-project-data';
import {
  createPartLocally,
  updatePartLocally,
  deletePartLocally
} from '@/lib/offline/repositories/parts';
import { createCounterLocally } from '@/lib/offline/repositories/counters';
import {
  toggleStopwatchLocally,
  resetStopwatchLocally
} from '@/lib/offline/repositories/projects';

interface Props {
  project: Project;
  parts?: Part[];
  pdfAnnotations?: PdfAnnotation[];
}

export default function Show({
  project: initialProject,
  parts: initialParts = [],
  pdfAnnotations: initialAnnotations = [],
}: Props) {
  // Use offline data hook to subscribe to Dexie changes
  const { project, parts, annotations: pdfAnnotations } = useProjectData(
    initialProject as any,
    initialParts as any,
    initialAnnotations as any
  ) as { project: Project, parts: Part[], annotations: PdfAnnotation[] };

  const { view, setView, isMobile, effectiveView } = useProjectViewState({
    hasPdf: !!project.pdf_path,
  });

  const displaySeconds = useStopwatch(project);

  const [currentPartId, setCurrentPartId] = useState<string>(
    parts[0]?.id || '',
  );

  const prevPartsLength = useRef(parts.length);

  const currentPart = parts.find((p) => p.id === currentPartId);

  // Refresh trigger for PDF viewer
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-select logic
  useEffect(() => {
    // If no part is selected but we have parts, select the first one
    if (!currentPartId && parts.length > 0) {
      setCurrentPartId(parts[0].id);
    }

    // If a new part was added, select it
    if (parts.length > prevPartsLength.current) {
      setCurrentPartId(parts[parts.length - 1].id);
    }

    prevPartsLength.current = parts.length;
  }, [parts, currentPartId]);

  const handleCreatePart = async () => {
    try {
      const newPartId = crypto.randomUUID();
      const newPart = {
        id: newPartId,
        project_id: project.id,
        name: `Part ${parts.length + 1}`,
        position: parts.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
      await createPartLocally(newPart);

      // Every part must have exactly one global counter
      await createCounterLocally({
        id: crypto.randomUUID(),
        part_id: newPartId,
        name: 'Global Counter',
        current_value: 1, // Start at 1 as per backend logic
        reset_at: null,
        reset_count: 0,
        show_reset_count: false,
        is_global: true,
        is_linked: false,
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      });

      setCurrentPartId(newPartId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePart = async (partId: string, updates: Partial<Part>) => {
    await updatePartLocally(partId, updates);
  };

  const handleDeletePart = async (partId: string) => {
    if (parts.length <= 1 && parts[0].id === partId) return;
    if (confirm('Are you sure you want to delete this part?')) {
      await deletePartLocally(partId);
      if (currentPartId === partId) {
        setCurrentPartId(parts.find(p => p.id !== partId)?.id || '');
      }
    }
  };

  const handleCreateCounter = async () => {
    if (!currentPartId) return;
    try {
      await createCounterLocally({
        id: crypto.randomUUID(),
        part_id: currentPartId,
        name: 'New Counter',
        current_value: 1,
        reset_at: null,
        reset_count: 0,
        show_reset_count: false,
        is_global: false,
        is_linked: true, // New counters default to being linked to global
        position: (currentPart?.counters?.length || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStopwatch = async () => {
    await toggleStopwatchLocally(project.id);
  };

  const handleResetStopwatch = async () => {
    if (confirm('Reset stopwatch?')) {
      await resetStopwatchLocally(project.id);
    }
  };

  const handlePdfUpload = (_url: string | null) => {
    // Force a complete refresh of the PDF viewer
    setRefreshTrigger(prev => prev + 1);
  };

  // Generate PDF URL with cache-busting parameter
  const pdfUrl = project.pdf_path
    ? `${route('projects.pattern', project.id)}?v=${new Date(project.updated_at).getTime()}&t=${refreshTrigger}`
    : null;

  // Render counters content
  const renderCounters = (isSplitView = false) => (
    <div className="space-y-8">
      {currentPart ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{currentPart.name}</h2>
          </div>

          {currentPart.counters && currentPart.counters.length > 0 ? (
            <div
              className={
                isSplitView
                  ? 'space-y-4'
                  : 'grid grid-cols-2 gap-3 pb-13 lg:grid-cols-3 xl:grid-cols-4'
              }
            >
              {currentPart.counters.map((counter) => (
                <div key={counter.id} className="@container">
                  <CounterCard counter={counter} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-none border-2 border-dashed py-12 text-center">
              <p>No counters yet.</p>
              <p className="mt-2 text-sm">Create one from the sidebar.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
          <p>No part selected.</p>
          <p>Create a part to get started.</p>
        </div>
      )}
    </div>
  );

  // Render PDF viewer
  const renderPdfViewer = () => {
    if (!pdfUrl) {
      return (
        <div className="text-muted-foreground flex h-full items-center justify-center">
          <p>No PDF uploaded for this project.</p>
        </div>
      );
    }

    return (
      <PdfViewer
        key={`pdf-viewer-${project.id}-${project.updated_at}`}
        pdfUrl={pdfUrl}
        projectId={project.id}
        initialAnnotations={pdfAnnotations}
      />
    );
  };

  return (
    <>
      <Head title={project.name} />
      <div className="bg-background flex h-svh overflow-hidden">
        <ProjectSidebar
          project={project}
          parts={parts}
          currentPartId={currentPartId}
          onSelectPart={setCurrentPartId}
          onCreatePart={handleCreatePart}
          onUpdatePart={handleUpdatePart}
          onDeletePart={handleDeletePart}
          onCreateCounter={handleCreateCounter}
          view={effectiveView}
          onViewChange={setView}
          stopwatchSeconds={displaySeconds}
          isStopwatchRunning={project.stopwatch_running}
          onToggleStopwatch={handleToggleStopwatch}
          onResetStopwatch={handleResetStopwatch}
          onPdfUpload={handlePdfUpload}
        />
        <main
          className="relative flex flex-1 overflow-hidden"
          style={
            isMobile
              ? { paddingBottom: 'calc(var(--spacing) * 12)' }
              : undefined
          }
        >
          {/* Counters View */}
          {effectiveView === 'counters' && (
            <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto max-w-screen-2xl">{renderCounters()}</div>
            </div>
          )}

          {/* PDF View - Always mounted but controlled by CSS visibility */}
          {pdfUrl && (
            <div
              className={`absolute inset-0 flex ${effectiveView === 'split' ? '' : ''}
                         ${effectiveView === 'pdf' || effectiveView === 'split' ? 'visible opacity-100 z-0' : 'invisible opacity-0 -z-10'}`}
              style={{
                pointerEvents: effectiveView === 'pdf' || effectiveView === 'split' ? 'auto' : 'none',
              }}
            >
              {/* PDF Side - takes full width in pdf view, flex-1 in split view */}
              <div className={effectiveView === 'split' && !isMobile ? 'border-border flex-1 border-r' : 'flex-1'}>
                {renderPdfViewer()}
              </div>
              {/* Counters Side - Only visible in split view */}
              {effectiveView === 'split' && !isMobile && (
                <div className="w-[220px] shrink-0 overflow-y-auto p-3 md:w-[260px] md:p-4 lg:w-[280px]">
                  <div className="mx-auto max-w-[220px]">
                    {renderCounters(true)}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <ResponsiveToaster />
    </>
  );
}