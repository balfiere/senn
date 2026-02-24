import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Part, Project } from '@/types';
import { Link } from '@inertiajs/react';
import { Home, PanelLeftClose, Plus, Trash2, Upload } from 'lucide-react';

import { SidebarPartItem } from './SidebarPartItem';
import { SidebarStopwatch } from './SidebarStopwatch';
import { SidebarViewState } from './SidebarViewState';

interface DesktopSidebarViewProps {
    project: Project;
    parts: Part[];
    currentPartId: string;
    onSelectPart: (id: string) => void;
    onCreatePart: () => void;
    onUpdatePart: (id: string, updates: Partial<Part>) => void;
    onDeletePart: (id: string) => void;
    onCreateCounter: () => void;
    view: 'counters' | 'pdf' | 'split';
    onViewChange: (view: 'counters' | 'pdf' | 'split') => void;
    stopwatchSeconds: number;
    isStopwatchRunning: boolean;
    onToggleStopwatch: () => void;
    onResetStopwatch: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePdfDelete: () => void;
}

export function DesktopSidebarView({
    project,
    parts,
    currentPartId,
    onSelectPart,
    onCreatePart,
    onUpdatePart,
    onDeletePart,
    onCreateCounter,
    view,
    onViewChange,
    stopwatchSeconds,
    isStopwatchRunning,
    onToggleStopwatch,
    onResetStopwatch,
    isCollapsed,
    setIsCollapsed,
    isUploading,
    handleFileUpload,
    handlePdfDelete,
}: DesktopSidebarViewProps) {
    if (isCollapsed) {
        return (
            <aside className="border-border bg-background flex h-screen w-14 flex-col border-r">
                <div className="border-border flex h-14 shrink-0 items-center justify-center border-b">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(false)}
                        className="text-popover-foreground"
                    >
                        <PanelLeftClose className="h-5 w-5 rotate-180" />
                    </Button>
                </div>
                <div className="flex flex-1 flex-col items-center gap-2 py-4">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-popover-foreground"
                    >
                        <Link href={route('projects.index')}>
                            <Home className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </aside>
        );
    }

    return (
        <aside className="border-border bg-background flex h-screen w-64 flex-col border-r">
            {/* Header */}
            <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-5">
                <h2
                    className="text-popover-foreground truncate text-sm tracking-[0.15em] uppercase"
                    title={project.name}
                >
                    {project.name}
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(true)}
                    className="text-popover-foreground h-7 w-7 shrink-0"
                >
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-8 p-5">
                    {/* Navigation */}
                    <div className="space-y-1">
                        <Button
                            asChild
                            variant="ghost"
                            className="text-popover-foreground hover:bg-muted/60 w-full justify-start text-xs tracking-wider uppercase"
                        >
                            <Link href={route('projects.index')} prefetch>
                                <Home className="mr-2 h-3.5 w-3.5" />
                                All Projects
                            </Link>
                        </Button>
                    </div>

                    {/* Parts */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-popover-foreground/60 text-xs font-medium uppercase">
                                Parts
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-popover-foreground h-6 w-6"
                                onClick={onCreatePart}
                                title="Add part"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1">
                            {parts.map((part) => (
                                <SidebarPartItem
                                    key={part.id}
                                    part={part}
                                    isCurrent={currentPartId === part.id}
                                    onSelect={onSelectPart}
                                    onUpdate={onUpdatePart}
                                    onDelete={onDeletePart}
                                    canDelete={parts.length > 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Counters */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-popover-foreground/60 text-xs font-medium uppercase">
                                Counters
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-popover-foreground h-6 w-6"
                                onClick={onCreateCounter}
                                title="Add counter"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* View Options */}
                    {project.pdf_path && (
                        <div className="flex flex-col">
                            <span className="text-popover-foreground/60 mb-2 text-xs font-medium uppercase">
                                View
                            </span>
                            <SidebarViewState
                                view={view}
                                onViewChange={onViewChange}
                            />
                        </div>
                    )}

                    {/* PDF Upload */}
                    <div className="flex flex-col">
                        <span className="text-popover-foreground/60 mb-2 text-xs font-medium uppercase">
                            Pattern PDF
                        </span>
                        <div>
                            <Input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="pdf-upload"
                                disabled={isUploading}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-muted/30 border-border text-popover-foreground w-full justify-start font-light"
                                onClick={() =>
                                    document
                                        .getElementById('pdf-upload')
                                        ?.click()
                                }
                                disabled={isUploading}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading
                                    ? 'Uploading...'
                                    : project.pdf_path
                                      ? 'Change PDF'
                                      : 'Upload PDF'}
                            </Button>
                            {project.pdf_path && !isUploading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2 w-full justify-start font-light"
                                    onClick={handlePdfDelete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete PDF
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stopwatch */}
                    <div className="flex flex-col">
                        <span className="text-popover-foreground/60 mb-2 text-xs font-medium uppercase">
                            Time Tracker
                        </span>
                        <SidebarStopwatch
                            seconds={stopwatchSeconds}
                            isRunning={isStopwatchRunning}
                            onToggle={onToggleStopwatch}
                            onReset={onResetStopwatch}
                            timeClassName="text-xl"
                        />
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
}
