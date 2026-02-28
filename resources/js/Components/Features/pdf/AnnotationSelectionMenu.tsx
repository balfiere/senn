import { PdfAnnotationSubtype } from '@embedpdf/models';
import {
    useAnnotationCapability,
    type AnnotationSelectionMenuProps as BaseProps,
} from '@embedpdf/plugin-annotation/react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

import { ANNOTATION_COLORS } from './utils';

interface AnnotationSelectionMenuProps extends BaseProps {
    documentId: string;
    onOpenComment: (annotation: Record<string, unknown> | null) => void;
}

export function AnnotationSelectionMenu({
    selected,
    context,
    documentId,
    menuWrapperProps,
    rect,
    onOpenComment,
}: AnnotationSelectionMenuProps) {
    const { provides: annotationCapability } = useAnnotationCapability();
    const annotationScope = annotationCapability?.forDocument(documentId);
    const [showColors, setShowColors] = useState(false);

    const obj = context.annotation?.object as unknown as
        | Record<string, unknown>
        | undefined;
    const type = obj?.type as number | undefined;

    // Determine the relevant color property based on annotation type
    let currentColor = obj?.color as string | undefined;
    if (
        type === PdfAnnotationSubtype.HIGHLIGHT ||
        type === PdfAnnotationSubtype.UNDERLINE ||
        type === PdfAnnotationSubtype.STRIKEOUT ||
        type === PdfAnnotationSubtype.SQUIGGLY ||
        type === PdfAnnotationSubtype.LINE ||
        type === PdfAnnotationSubtype.POLYLINE ||
        type === PdfAnnotationSubtype.POLYGON ||
        type === PdfAnnotationSubtype.INK ||
        type === PdfAnnotationSubtype.SQUARE ||
        type === PdfAnnotationSubtype.CIRCLE
    ) {
        currentColor =
            (obj?.strokeColor as string) ||
            (obj?.stroke_color as string) ||
            (obj?.color as string);
    } else if (type === PdfAnnotationSubtype.FREETEXT) {
        currentColor = (obj?.fontColor as string) || (obj?.color as string);
    }

    currentColor = currentColor || '#cba6f7';

    const handleDelete = useCallback(() => {
        if (!annotationScope) return;
        const annObj = context.annotation.object as unknown as {
            pageIndex: number;
            id: string;
        };
        const { pageIndex, id } = annObj;
        annotationScope.deleteAnnotation(pageIndex, id);
    }, [annotationScope, context.annotation]);

    const handleColorChange = useCallback(
        (color: string) => {
            if (!annotationScope) return;
            const annObj = context.annotation.object as unknown as {
                pageIndex: number;
                id: string;
                type: number;
            };
            const { pageIndex, id, type: annType } = annObj;
            const patch: Record<string, unknown> = { color };

            // Update the relevant color property based on annotation type
            if (
                annType === PdfAnnotationSubtype.HIGHLIGHT ||
                annType === PdfAnnotationSubtype.UNDERLINE ||
                annType === PdfAnnotationSubtype.STRIKEOUT ||
                annType === PdfAnnotationSubtype.SQUIGGLY ||
                annType === PdfAnnotationSubtype.LINE ||
                annType === PdfAnnotationSubtype.POLYLINE ||
                annType === PdfAnnotationSubtype.POLYGON ||
                annType === PdfAnnotationSubtype.INK ||
                annType === PdfAnnotationSubtype.SQUARE ||
                annType === PdfAnnotationSubtype.CIRCLE
            ) {
                patch.strokeColor = color;
            } else if (annType === PdfAnnotationSubtype.FREETEXT) {
                patch.fontColor = color;
            }

            annotationScope.updateAnnotation(pageIndex, id, patch);
        },
        [annotationScope, context.annotation],
    );

    if (!selected) return null;

    const menuStyle: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'default',
        top: rect.size.height + 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
    };

    return (
        <div {...menuWrapperProps}>
            <div
                style={menuStyle}
                className="border-border bg-card rounded-none border shadow-lg"
            >
                <div className="flex items-center gap-1 px-1.5 py-1.5">
                    {/* Color button */}
                    <Popover open={showColors} onOpenChange={setShowColors}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground rounded-sm"
                                title="Change color"
                            >
                                <div
                                    className="border-border h-4 w-4 rounded-sm border"
                                    style={{ backgroundColor: currentColor }}
                                />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" side="top">
                            <div className="grid grid-cols-8 gap-1.5">
                                {ANNOTATION_COLORS.map((color) => (
                                    <Button
                                        key={color.value}
                                        className={cn(
                                            'ring-ring h-4 w-4 rounded-sm border-none px-2 transition-all',
                                            currentColor === color.value
                                                ? 'scale-115 ring-1'
                                                : 'hover:scale-110',
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => {
                                            handleColorChange(color.value);
                                            setShowColors(false);
                                        }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Separator orientation="vertical" className="mx-1 h-4" />

                    {/* Comment button */}
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground rounded-sm"
                        onClick={() => onOpenComment(obj || null)}
                        title="Add comment"
                    >
                        <MessageSquare size={16} />
                    </Button>

                    {/* Delete button */}
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground rounded-sm"
                        onClick={handleDelete}
                        title="Delete annotation"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
