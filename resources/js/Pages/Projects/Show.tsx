import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Project, Part } from '@/types';
import { ProjectSidebar } from '@/Components/ProjectSidebar';

interface Props {
  project: Project;
  parts?: Part[];
}

export default function Show({ project, parts: initialParts = [] }: Props) {
  // Dummy parts if none provided for immediate UI feedback
  const [parts, setParts] = useState<Part[]>(initialParts.length > 0 ? initialParts : [
    { id: '1', project_id: project.id, name: 'Part 1: Body', position: 0, created_at: '', updated_at: '', counters: [] },
    { id: '2', project_id: project.id, name: 'Part 2: Sleeve', position: 1, created_at: '', updated_at: '', counters: [] }
  ]);

  const [currentPartId, setCurrentPartId] = useState<string>(parts[0]?.id || "");
  const [view, setView] = useState<"counters" | "pdf" | "split">("counters");
  const [stopwatchSeconds, setStopwatchSeconds] = useState(project.stopwatch_seconds);
  const [isRunning, setIsRunning] = useState(project.stopwatch_running);
  const [isMobile, setIsMobile] = useState(false);

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

  // Handlers (stubbed for UI only)
  const handleCreatePart = () => {
    console.log("Create part clicked");
    // Mock for UI feedback
    const newPart = {
      id: crypto.randomUUID(),
      project_id: project.id,
      name: `Part ${parts.length + 1}`,
      position: parts.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      counters: []
    };
    setParts([...parts, newPart]);
    setCurrentPartId(newPart.id);
  };

  const handleUpdatePart = (partId: string, updates: Partial<Part>) => {
    console.log("Update part clicked", partId, updates);
    setParts(parts.map(p => p.id === partId ? { ...p, ...updates } : p));
  };

  const handleDeletePart = (partId: string) => {
    console.log("Delete part clicked", partId);
    if (parts.length <= 1) return;
    const newParts = parts.filter(p => p.id !== partId);
    setParts(newParts);
    if (currentPartId === partId) {
      setCurrentPartId(newParts[0]?.id || "");
    }
  };

  const handleCreateCounter = () => {
    console.log("Create counter clicked");
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
          className="flex flex-1 overflow-hidden items-center justify-center bg-muted/20"
          style={isMobile ? { paddingBottom: "calc(var(--spacing) * 12)" } : undefined}
        >
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
            <div className="text-muted-foreground p-4 bg-background rounded border">
              <p>Current View: {effectiveView}</p>
              <p>Selected Part: {currentPart?.name || 'None'}</p>
              <p>Project ID: {project.id}</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
