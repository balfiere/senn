import { Link } from "@inertiajs/react"
import { Home, PanelLeftClose, X, Plus, Upload, Trash2 } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Input } from '@/Components/ui/input';
import { Project, Part } from "@/types"
import { cn } from "@/lib/utils"
import { SidebarPartItem } from "./SidebarPartItem"
import { SidebarStopwatch } from "./SidebarStopwatch"
import { SidebarViewState } from "./SidebarViewState"

interface MobileSidebarViewProps {
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
    isMobileExpanded: boolean
    setIsMobileExpanded: (expanded: boolean) => void
    isUploading: boolean
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    handlePdfDelete: () => void
}

export function MobileSidebarView({
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
    isMobileExpanded,
    setIsMobileExpanded,
    isUploading,
    handleFileUpload,
    handlePdfDelete,
}: MobileSidebarViewProps) {
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
                            <div className="p-4 space-y-6" style={{ paddingBottom: "calc(var(--spacing) * 17)" }}>
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

                                {/* View Options */}
                                {project.pdf_path && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">View</span>
                                        <SidebarViewState
                                            view={view}
                                            onViewChange={onViewChange}
                                            isMobile={true}
                                        />
                                    </div>
                                )}

                                {/* PDF Upload */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">Pattern PDF</span>
                                    <div>
                                        <Input
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
                                            className="w-full justify-start bg-muted/30 text-popover-foreground font-light"
                                            onClick={() => document.getElementById("pdf-upload-mobile")?.click()}
                                            disabled={isUploading}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {isUploading ? "Uploading..." : project.pdf_path ? "Change PDF" : "Upload PDF"}
                                        </Button>
                                        {project.pdf_path && !isUploading && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 font-light mt-2"
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
                                    <span className="text-sm font-medium uppercase text-popover-foreground/60 mb-2">Time Tracker</span>
                                    <SidebarStopwatch
                                        seconds={stopwatchSeconds}
                                        isRunning={isStopwatchRunning}
                                        onToggle={onToggleStopwatch}
                                        onReset={onResetStopwatch}
                                        timeClassName="text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
