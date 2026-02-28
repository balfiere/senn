import { useScroll } from '@embedpdf/plugin-scroll/react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';

import type { StoredAnnotation } from './utils';

interface CommentsSidebarProps {
    annotations: StoredAnnotation[];
    selectedAnnotation: StoredAnnotation | null;
    setSelectedAnnotation: (annotation: StoredAnnotation | null) => void;
    annotationApi: Record<string, unknown> | null;
    commentTrigger?: number;
    documentId: string;
}

// Helper to format date
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return dateString;
    }
};

export function CommentsSidebar({
    annotations,
    selectedAnnotation,
    setSelectedAnnotation,
    annotationApi,
    commentTrigger = 0,
    documentId,
}: CommentsSidebarProps) {
    const { provides: scrollApi } = useScroll(documentId);
    const [editingComment, setEditingComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedAnnotation) {
            setEditingComment(selectedAnnotation.comment || '');
            // Enter edit mode if it's a new selection without a comment
            if (!selectedAnnotation.comment) {
                setIsEditing(true);
                setTimeout(() => textareaRef.current?.focus(), 50);
            } else {
                setIsEditing(false);
            }

            // Scroll to selected annotation
            setTimeout(() => {
                selectedRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        } else {
            setIsEditing(false);
        }
    }, [selectedAnnotation, setEditingComment, setIsEditing]);

    // Respond to external comment trigger (e.g. from context menu)
    useEffect(() => {
        if (commentTrigger > 0 && selectedAnnotation) {
            setIsEditing(true);
            setTimeout(() => {
                textareaRef.current?.focus();
                selectedRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 50);
        }
    }, [commentTrigger, selectedAnnotation, setIsEditing]);

    // Focus input when isEditing becomes true
    useEffect(() => {
        if (isEditing) {
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }, [isEditing]);

    // Group by Page
    const groupedByPage = annotations.reduce(
        (acc, ann) => {
            const page = ann.page_number;
            if (!acc[page]) acc[page] = [];
            acc[page].push(ann);
            return acc;
        },
        {} as Record<number, StoredAnnotation[]>,
    );

    // Sort by Date within Page
    Object.keys(groupedByPage).forEach((page) => {
        groupedByPage[Number(page)].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
        );
    });

    const sortedPages = Object.keys(groupedByPage)
        .map(Number)
        .sort((a, b) => a - b);

    const handleSaveComment = async () => {
        if (!selectedAnnotation || !annotationApi) return;

        const api = annotationApi as {
            updateAnnotation: (
                pageIndex: number,
                id: string,
                data: Record<string, unknown>,
            ) => void;
        };
        api.updateAnnotation(
            selectedAnnotation.page_number - 1,
            selectedAnnotation.embedpdf_annotation_id,
            {
                comment: editingComment,
                modified: new Date(),
            },
        );

        setIsEditing(false);
    };

    const handleDeleteAnnotation = (id: string, pageIndex: number) => {
        if (!annotationApi) return;
        const api = annotationApi as {
            deleteAnnotation: (pageIndex: number, id: string) => void;
        };
        api.deleteAnnotation(pageIndex, id);
    };

    return (
        <div className="bg-background flex h-full w-full flex-col">
            <ScrollArea className="min-h-0 flex-1" ref={scrollAreaRef}>
                <div className="space-y-6 p-3">
                    {sortedPages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-2 p-8 text-center opacity-50">
                            <MessageSquare className="mb-2 h-8 w-8" />
                            <p className="text-sm font-medium">
                                No threads yet
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Select an annotation to start a conversation.
                            </p>
                        </div>
                    ) : (
                        sortedPages.map((pageNumber) => (
                            <div key={pageNumber} className="space-y-3">
                                <div className="border-border/50 bg-background/95 sticky top-0 z-10 border-b py-1">
                                    <h4 className="text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase">
                                        Page {pageNumber}
                                    </h4>
                                </div>

                                {groupedByPage[pageNumber].map((root) => {
                                    const isSelected =
                                        selectedAnnotation?.embedpdf_annotation_id ===
                                        root.embedpdf_annotation_id;
                                    const refProps = isSelected
                                        ? { ref: selectedRef }
                                        : {};

                                    return (
                                        <div
                                            key={root.id}
                                            {...refProps}
                                            className={cn(
                                                'scroll-mt-20 overflow-hidden rounded-none border shadow-xs transition-all duration-200',
                                                isSelected
                                                    ? 'border-primary/30 bg-popover'
                                                    : 'border-border bg-card hover:border-secondary/60',
                                            )}
                                            onClick={() => {
                                                setSelectedAnnotation(root);
                                                if (!root.comment)
                                                    setIsEditing(true);

                                                // Scroll to annotation on PDF
                                                if (
                                                    scrollApi &&
                                                    root.position_x !== null &&
                                                    root.position_y !== null
                                                ) {
                                                    scrollApi.scrollToPage({
                                                        pageNumber:
                                                            root.page_number,
                                                        pageCoordinates: {
                                                            x: root.position_x,
                                                            y: root.position_y,
                                                        },
                                                        alignX: 50,
                                                        alignY: 50,
                                                    });
                                                }
                                            }}
                                        >
                                            {/* Root Card Content */}
                                            <div className="space-y-3 p-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full shadow-xs"
                                                        style={{
                                                            backgroundColor:
                                                                ([
                                                                    'line',
                                                                    'lineArrow',
                                                                    'square',
                                                                ].includes(
                                                                    root.annotation_type,
                                                                )
                                                                    ? root.stroke_color ||
                                                                    root.color
                                                                    : root.color) ||
                                                                '#cba6f7',
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground/80 text-[10px] font-bold tracking-wider uppercase">
                                                        {root.annotation_type} •{' '}
                                                        {formatDate(
                                                            root.created_at,
                                                        )}
                                                    </span>
                                                    <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAnnotation(
                                                                    root.embedpdf_annotation_id,
                                                                    root.page_number -
                                                                    1,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isSelected && isEditing ? (
                                                    <div
                                                        className="space-y-2"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Textarea
                                                            ref={textareaRef}
                                                            value={
                                                                editingComment
                                                            }
                                                            onChange={(e) =>
                                                                setEditingComment(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Write your observation..."
                                                            className="border-primary/20 focus-visible:ring-primary/30 min-h-[90px] resize-none text-sm"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8"
                                                                onClick={() =>
                                                                    setIsEditing(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 grow"
                                                                onClick={
                                                                    handleSaveComment
                                                                }
                                                            >
                                                                <Send className="mr-2 h-3 w-3" />
                                                                Post
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="group/content relative">
                                                        {root.comment ? (
                                                            <p
                                                                className="text-foreground/90 text-sm leading-relaxed break-words wrap-break-word whitespace-pre-wrap"
                                                                style={{
                                                                    overflowWrap:
                                                                        'anywhere',
                                                                }}
                                                            >
                                                                {root.comment}
                                                            </p>
                                                        ) : (
                                                            <p
                                                                className="text-muted-foreground text-xs wrap-break-word italic"
                                                                style={{
                                                                    overflowWrap:
                                                                        'anywhere',
                                                                }}
                                                            >
                                                                Click to add
                                                                comment...
                                                            </p>
                                                        )}
                                                        {isSelected &&
                                                            !isEditing &&
                                                            root.comment && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-muted-foreground hover:text-primary absolute -top-2 -right-2 h-6 px-2 text-[10px]"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setIsEditing(
                                                                            true,
                                                                        );
                                                                        setEditingComment(
                                                                            root.comment ||
                                                                            '',
                                                                        );
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
