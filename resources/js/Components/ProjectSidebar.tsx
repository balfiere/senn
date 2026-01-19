import { useState, useEffect } from "react"
import { Project, Part } from "@/types"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { router } from "@inertiajs/react"
import {
    Home,
    Plus,
    Clock,
    FileText,
    PanelLeftClose,
    Play,
    Pause,
    RotateCcw,
    Upload,
    Trash2,
    LayoutGrid,
    Columns,
    Pencil,
    Check,
    X,
} from "lucide-react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
    project: Project
    parts: Part[]
    currentPartId: string
    onSelectPart: (partId: string) => void
    onCreatePart: () => void
    onUpdatePart: (partId: string, updates: Partial<Part>) => void
    onDeletePart: (partId: string) => void
    onCreateCounter: () => void
    view: "counters" | "pdf" | "split"
    onViewChange: (view: "counters" | "pdf" | "split") => void
    stopwatchSeconds: number
    isStopwatchRunning: boolean
    onToggleStopwatch: () => void
    onResetStopwatch: () => void
    onPdfUpload: (url: string | null) => void
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function ProjectSidebar({
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
    onPdfUpload,
}: ProjectSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [editingPartId, setEditingPartId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 880)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        const formData = new FormData()
        formData.append("pdf_file", file)
        formData.append("_method", "POST") // Actually we registered POST route, so no method spoofing needed for my custom route? Wait, I registered POST /projects/{project} which points to update. 
        // If I used standard resource route (PUT/PATCH), I'd need _method: PATCH.
        // My route is: Route::post('/projects/{project}', [ProjectController::class, 'update']);
        // So standard POST is fine.

        // Wait, standard route for update is PUT/PATCH. I defined POST explicitly to avoid issues.
        // So I just post to route('projects.update', project.id).

        /* 
        ERROR: 'projects.update' might conflict if resource controller was used? 
        I manually defined: Route::post('/projects/{project}', ...)->name('projects.update');
        Standard resource is PUT/PATCH. I am overriding it or adding it?
        I did NOT use Route::resource. I used individual routes.
        So POST is correct.
        */

        router.post(route('projects.update', project.id), {
            _method: 'PATCH',
            pdf_file: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setIsUploading(false),
            onSuccess: () => {
                // Determine URL for optimistic? Or just let props update.
                // onPdfUpload callback might be expected to update something?
                // The prop onPdfUpload in Show.tsx just logs.
                // We rely on inertia reload.
            }
        })
    }

    const startEditing = (part: Part) => {
        setEditingPartId(part.id)
        setEditingName(part.name)
    }

    const saveEdit = () => {
        if (editingPartId && editingName.trim()) {
            onUpdatePart(editingPartId, { name: editingName.trim() })
        }
        setEditingPartId(null)
        setEditingName("")
    }

    const cancelEdit = () => {
        setEditingPartId(null)
        setEditingName("")
    }

    // Mobile Bottom Bar Implementation
    if (isMobile) {
        return (
            <>
                {/* Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
                    <div className="flex items-center justify-around px-4 py-2">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-popover-foreground"
                        >
                            <Link href={route('projects.index')} className="flex flex-col items-center gap-1">
                                <Home className="h-5 w-5" />
                                <span className="text-xs">Projects</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                            className="flex-1 text-popover-foreground"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <PanelLeftClose className={cn("h-5 w-5", isMobileExpanded ? "rotate-180" : "")} />
                                <span className="text-xs">{isMobileExpanded ? "Close" : "Menu"}</span>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Mobile Overlay Menu */}
                {isMobileExpanded && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setIsMobileExpanded(false)}
                    >
                        <div
                            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-lg h-dvh flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                                <h2 className="font-medium text-popover-foreground">{project.name}</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileExpanded(false)}
                                    className="text-popover-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto overscroll-contain">
                                <div className="p-4 space-y-6" style={isMobile ? { paddingBottom: "calc(var(--spacing) * 17)" } : undefined}>
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
                                                <div
                                                    key={part.id}
                                                    className={cn(
                                                        "group flex items-center gap-1.5 px-2 py-1.5 text-sm transition-all duration-300 rounded-xs",
                                                        currentPartId === part.id
                                                            ? "bg-secondary hover:bg-secondary/80"
                                                            : "hover:bg-muted/60 hover:text-accent-foreground dark:hover:bg-accent/50 h-9",
                                                    )}
                                                >
                                                    {editingPartId === part.id ? (
                                                        <>
                                                            <Input
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                className="flex-1"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") saveEdit()
                                                                    if (e.key === "Escape") cancelEdit()
                                                                }}
                                                            />
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={saveEdit}>
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={cancelEdit}>
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="flex-1 text-left"
                                                                onClick={() => onSelectPart(part.id)}
                                                                title={part.name}
                                                            >
                                                                {part.name}
                                                            </button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 shrink-0"
                                                                onClick={() => startEditing(part)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            {parts.length > 1 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-destructive shrink-0"
                                                                    onClick={() => onDeletePart(part.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Counters */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium uppercase text-popover-foreground/60">Counters</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-popover-foreground"
                                                onClick={onCreateCounter}
                                                title="Add counter"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* View Options - Hide split view on mobile */}
                                    {project.pdf_path && (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">View</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={view === "counters" ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="text-popover-foreground"
                                                    onClick={() => onViewChange("counters")}
                                                    title="Counters only"
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={view === "pdf" ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="text-popover-foreground"
                                                    onClick={() => onViewChange("pdf")}
                                                    title="PDF only"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* PDF Upload */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">Pattern PDF</span>
                                        <div>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="pdf-upload-mobile"
                                                disabled={isUploading}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start bg-muted/30 text-popover-foreground "
                                                onClick={() => document.getElementById("pdf-upload-mobile")?.click()}
                                                disabled={isUploading}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {isUploading ? "Uploading..." : project.pdf_path ? "Change PDF" : "Upload PDF"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stopwatch */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">Time Tracker</span>
                                        <div className="rounded-none border border-border p-3">
                                            <div className="flex items-center justify-center mb-2">
                                                <Clock className="mr-2 h-4 w-4 text-popover-foreground/60" />
                                                <span className="font-mono text-lg text-popover-foreground">{formatTime(stopwatchSeconds)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={isStopwatchRunning ? "secondary" : "default"}
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={onToggleStopwatch}
                                                >
                                                    {isStopwatchRunning ? (
                                                        <>
                                                            <Pause className="mr-1 h-3 w-3" />
                                                            Pause
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="mr-1 h-3 w-3" />
                                                            Start
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-muted/30 border-border"
                                                    onClick={onResetStopwatch}
                                                    title="Reset"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    // Desktop Sidebar Implementation
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
                            <Link href={route('projects.index')}>
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
                                <div
                                    key={part.id}
                                    className={cn(
                                        "group flex items-center gap-1.5 px-2 py-1.5 text-sm transition-all duration-300 rounded-xs",
                                        currentPartId === part.id
                                            ? "bg-secondary hover:bg-secondary/80"
                                            : "hover:bg-muted/60 hover:text-accent-foreground dark:hover:bg-accent/50 h-9",
                                    )}
                                >
                                    {editingPartId === part.id ? (
                                        <>
                                            <Input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="h-6"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit()
                                                    if (e.key === "Escape") cancelEdit()
                                                }}
                                            />
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={saveEdit}>
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={cancelEdit}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="flex-1 text-left truncate"
                                                onClick={() => onSelectPart(part.id)}
                                                title={part.name}
                                            >
                                                {part.name}
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                                                onClick={() => startEditing(part)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            {parts.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
                                                    onClick={() => onDeletePart(part.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
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
                            <div className="grid grid-cols-3 gap-1">
                                <Button
                                    variant={view === "counters" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="text-popover-foreground"
                                    onClick={() => onViewChange("counters")}
                                    title="Counters only"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={view === "pdf" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="text-popover-foreground"
                                    onClick={() => onViewChange("pdf")}
                                    title="PDF only"
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={view === "split" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="text-popover-foreground"
                                    onClick={() => onViewChange("split")}
                                    title="Split view"
                                >
                                    <Columns className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* PDF Upload */}
                    <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase text-popover-foreground/60 mb-2">Pattern PDF</span>
                        <div>
                            <input
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
                                className="w-full justify-start bg-muted/30 border-border text-popover-foreground"
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
                        <div className="rounded-none border border-border p-3">
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="mr-2 h-4 w-4 text-popover-foreground/60" />
                                <span className="font-mono text-xl text-popover-foreground">{formatTime(stopwatchSeconds)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={isStopwatchRunning ? "secondary" : "default"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={onToggleStopwatch}
                                >
                                    {isStopwatchRunning ? (
                                        <>
                                            <Pause className="mr-1 h-3 w-3" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-1 h-3 w-3" />
                                            Start
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-muted/30 border-border"
                                    onClick={onResetStopwatch}
                                    title="Reset"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    )
}