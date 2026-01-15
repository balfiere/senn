import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Project, Part } from '@/types';
import { ProjectSidebar } from '@/Components/ProjectSidebar';
import { CounterCard } from '@/Components/CounterCard';
import { ResponsiveToaster } from '@/Components/ResponsiveToaster';

interface Props {
  project: Project;
  parts?: Part[];
}

export default function Show({ project, parts = [] }: Props) {
  const [currentPartId, setCurrentPartId] = useState<string>(parts[0]?.id || "");
  const [view, setView] = useState<"counters" | "pdf" | "split">("counters");
  const [stopwatchSeconds, setStopwatchSeconds] = useState(project.stopwatch_seconds);
  const [isRunning, setIsRunning] = useState(project.stopwatch_running);
  const [isMobile, setIsMobile] = useState(false);

  const prevPartsLength = useRef(parts.length);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 880);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentPart = parts.find((p) => p.id === currentPartId);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [isRunning]);
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
    // Only send scalar fields that can be updated
    const { name, position } = updates;
    router.patch(route('parts.update', partId), { name, position });
  };

  const handleDeletePart = (partId: string) => {
    if (parts.length <= 1 && parts[0].id === partId) return; // Prevent deleting last part if simplified logic desired, or just handle it. 
    // Actually, usually we allow deleting, but maybe warn? For now, direct delete.

    // If we are deleting the current part, we need to switch to another one.
    // However, Inertia reload happens after. 
    // We can optimistically switch or just let the prop update handle it?
    // Let's rely on props. But if passing `onSuccess`...

    router.delete(route('parts.destroy', partId), {
      onSuccess: () => {
        if (currentPartId === partId) {
          // Determine new ID. We can't know for sure until props update, 
          // but we can set to empty and let the useEffect above pick the first one?
          setCurrentPartId("");
        }
      }
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
    setIsRunning(!isRunning);
  };

  const handleResetStopwatch = () => {
    setStopwatchSeconds(0);
    setIsRunning(false);
  };

  const handlePdfUpload = (url: string | null) => {
    console.log("PDF Upload", url);
  };

  // Determine view based on PDF availability and viewport
  const effectiveView = !project.pdf_url ? "counters" : view;

  return (
    <>
      <Head title={project.name} />
      <div className="flex h-svh overflow-hidden bg-background">
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
          stopwatchSeconds={stopwatchSeconds}
          isStopwatchRunning={isRunning}
          onToggleStopwatch={handleToggleStopwatch}
          onResetStopwatch={handleResetStopwatch}
          onPdfUpload={handlePdfUpload}
        />
        <main
          className="flex flex-1 overflow-hidden bg-muted/20 relative"
          style={isMobile ? { paddingBottom: "calc(var(--spacing) * 12)" } : undefined}
        >
          {/* Main scrollable content */}
          <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
            <div className="max-w-screen-2xl mx-auto space-y-8">
              {currentPart ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{currentPart.name}</h2>
                    {/* Optional: Add Counter button here too */}
                  </div>

                  {currentPart.counters && currentPart.counters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentPart.counters.map(counter => (
                        <CounterCard key={counter.id} counter={counter} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                      <p>No counters yet.</p>
                      <p className="text-sm mt-2">Create one from the sidebar.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No part selected.</p>
                  <p>Create a part to get started.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ResponsiveToaster />
    </>
  );
}
