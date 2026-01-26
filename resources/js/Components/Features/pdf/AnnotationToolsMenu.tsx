import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    ArrowRight,
    Highlighter,
    Minus,
    MoreHorizontal,
    MousePointer2,
    Square,
    Type,
    Underline,
} from 'lucide-react';
import type React from 'react';
import { type AnnotationToolType } from './utils';
import { cn } from '@/lib/utils';
import { useAnnotation } from '@embedpdf/plugin-annotation/react';

interface AnnotationToolsMenuProps {
    documentId: string;
    activeTool: AnnotationToolType;
    onToolSelect: (tool: AnnotationToolType) => void;
    isPanning: boolean;
}

const tools: {
    id: AnnotationToolType;
    icon: React.ReactNode;
    label: string;
}[] = [
        { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select' },
        { id: 'highlight', icon: <Highlighter className="h-4 w-4" />, label: 'Highlight' },
        { id: 'underline', icon: <Underline className="h-4 w-4" />, label: 'Underline' },
        { id: 'freeText', icon: <Type className="h-4 w-4" />, label: 'Text' },
        { id: 'square', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
        { id: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
        { id: 'lineArrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
    ];

export function AnnotationToolsMenu({
    documentId,
    activeTool,
    onToolSelect,
    isPanning,
}: AnnotationToolsMenuProps) {
    // Determine which tool should be highlighted
    const getHighlightedTool = (toolId: AnnotationToolType) => {
        if (isPanning) return false;
        return activeTool === toolId;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Annotation Tools"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="min-w-[140px] rounded-none border-border bg-card shadow-lg"
            >
                {tools.map((tool) => (
                    <DropdownMenuItem
                        key={tool.id}
                        onClick={() => onToolSelect(tool.id)}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 cursor-pointer",
                            getHighlightedTool(tool.id) ? 'bg-secondary' : 'hover:bg-accent'
                        )}
                    >
                        <div className="flex-shrink-0">{tool.icon}</div>
                        <span className="text-sm font-medium">{tool.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
