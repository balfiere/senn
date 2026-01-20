import { Link } from "@inertiajs/react"
import { Home, PanelLeftClose, Plus, Upload } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Input } from '@/Components/ui/input';
import { Project, Part } from "@/types"
import { SidebarPartItem } from "./SidebarPartItem"
import { SidebarStopwatch } from "./SidebarStopwatch"
import { SidebarViewState } from "./SidebarViewState"

interface DesktopSidebarViewProps {
    project: Project
    parts: Part[]
    currentPartId: string
    onSelectPart: (id: string) => void
    onCreatePart: () => void
    onUpdatePart: (id: string, updates: Partial<Part>) => void
    onDeletePart: (id: string) => void
    onCreateCounter: () => void
    view: "counters" | "pdf" | "split"
    onViewChange: (view: "counters" | "pdf" | "split") => void
    stopwatchSeconds: number
    isStopwatchRunning: boolean
    onToggleStopwatch: () => void
    onResetStopwatch: () => void
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    isUploading: boolean
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
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
}: DesktopSidebarViewProps) {
    if (isCollapsed) {
        return (
            <aside className="flex w-14 flex-col border-r border-border bg-background h-screen">
                <div className="flex h-14 items-center justify-center border-b border-border shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="text-popover-foreground">
                        <PanelLeftClose className="h-5 w-5 rotate-180" />
                    </Button>
                </div>
                <div className="flex flex-1 flex-col items-center gap-2 py-4">
                    <Button asChild variant="ghost" size="icon" className="text-popover-foreground">
                        <Link href={route('projects.index')}>
                            <Home className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </aside>
        )
    }

    return (
        <aside className="flex w-64 flex-col border-r border-border bg-background h-screen">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-5 shrink-0">
                <h2 className="text-sm uppercase tracking-[0.15em] text-popover-foreground truncate" title={project.name}>
                    {project.name}
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(true)}
                    className="text-popover-foreground shrink-0 h-7 w-7"
                >
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-5 space-y-8">
                    {/* Navigation */}
                    <div className="space-y-1">
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start text-popover-foreground hover:bg-muted/60 text-xs uppercase tracking-wider"
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
                            <span className="text-xs font-medium uppercase text-popover-foreground/60">Parts</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-popover-foreground"
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
                            <span className="text-xs font-medium uppercase text-popover-foreground/60">Counters</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-popover-foreground"
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
                            <span className="text-xs font-medium uppercase text-popover-foreground/60 mb-2">View</span>
                            <SidebarViewState view={view} onViewChange={onViewChange} />
                        </div>
                    )}

                    {/* PDF Upload */}
                    <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase text-popover-foreground/60 mb-2">Pattern PDF</span>
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
                                className="w-full justify-start bg-muted/30 border-border text-popover-foreground font-light"
                                onClick={() => document.getElementById("pdf-upload")?.click()}
                                disabled={isUploading}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? "Uploading..." : project.pdf_path ? "Change PDF" : "Upload PDF"}
                            </Button>
                        </div>
                    </div>

                    {/* Stopwatch */}
                    <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase text-popover-foreground/60 mb-2">Time Tracker</span>
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
    )
}
