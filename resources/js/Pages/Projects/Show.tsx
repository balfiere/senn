import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { CounterCard } from '@/Components/Features/Counter/CounterCard';
import { PdfViewer } from '@/Components/Features/pdf/PdfViewer';
import { ProjectSidebar } from '@/Components/ProjectSidebar';
import { ResponsiveToaster } from '@/Components/Features/ResponsiveToaster';
import { useProjectViewState } from '@/hooks/useProjectViewState';
import { useStopwatch } from '@/hooks/useStopwatch';
import { Part, PdfAnnotation, Project } from '@/types';

interface Props {
  project: Project;
  parts?: Part[];
  pdfAnnotations?: PdfAnnotation[];
}

export default function Show({
  project,
  parts = [],
  pdfAnnotations = [],
}: Props) {
  const { view, setView, isMobile, effectiveView } = useProjectViewState({
    hasPdf: !!project.pdf_path,
  });

  const displaySeconds = useStopwatch(project);

  const [currentPartId, setCurrentPartId] = useState<string>(
    parts[0]?.id || '',
  );

  const prevPartsLength = useRef(parts.length);

  const currentPart = parts.find((p) => p.id === currentPartId);

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

  const handleCreatePart = () => {
    router.post(route('parts.store', project.id), {
      name: `Part ${parts.length + 1}`,
    });
  };

  const handleUpdatePart = (partId: string, updates: Partial<Part>) => {
    const { name, position } = updates;
    router.patch(route('parts.update', partId), { name, position });
  };

  const handleDeletePart = (partId: string) => {
    if (parts.length <= 1 && parts[0].id === partId) return;

    router.delete(route('parts.destroy', partId), {
      onSuccess: () => {
        if (currentPartId === partId) {
          setCurrentPartId('');
        }
      },
    });
  };

  const handleCreateCounter = () => {
    if (!currentPartId) return;
    router.post(route('counters.store', currentPartId), {
      name: 'New Counter',
      current_value: 0,
    });
  };

  const handleToggleStopwatch = () => {
    if (project.stopwatch_running) {
      router.patch(
        route('projects.stopwatch.stop', project.id),
        {},
        {
          preserveScroll: true,
        },
      );
    } else {
      router.patch(
        route('projects.stopwatch.start', project.id),
        {},
        {
          preserveScroll: true,
        },
      );
    }
  };

  const handleResetStopwatch = () => {
    router.patch(
      route('projects.stopwatch.reset', project.id),
      {},
      {
        preserveScroll: true,
      },
    );
  };

  const handlePdfUpload = (url: string | null) => {
    console.log('PDF Upload', url);
  };

  // Generate PDF URL
  const pdfUrl = project.pdf_path
    ? route('projects.pattern', project.id)
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