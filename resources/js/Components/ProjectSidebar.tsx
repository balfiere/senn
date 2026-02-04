import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"
import { Project, Part } from "@/types"
import { MobileSidebarView } from "./Features/ProjectSidebar/MobileSidebarView"
import { DesktopSidebarView } from "./Features/ProjectSidebar/DesktopSidebarView"

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

export function ProjectSidebar(props: ProjectSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
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

        router.post(route('projects.update', props.project.id), {
            _method: 'PATCH',
            pdf_file: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploading(false)
                // props.onPdfUpload(null)
                router.reload({ only: ['project'] })
            },
            onFinish: () => setIsUploading(false),
        })
    }

    const commonProps = {
        ...props,
        isUploading,
        handleFileUpload,
    }

    if (isMobile) {
        return (
            <MobileSidebarView
                {...commonProps}
                isMobileExpanded={isMobileExpanded}
                setIsMobileExpanded={setIsMobileExpanded}
            />
        )
    }

    return (
        <DesktopSidebarView
            {...commonProps}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
        />
    )
}