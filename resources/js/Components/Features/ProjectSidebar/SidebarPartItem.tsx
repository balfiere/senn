import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import { Part } from '@/types';

interface SidebarPartItemProps {
    part: Part;
    isCurrent: boolean;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Part>) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    className?: string;
}

export function SidebarPartItem({
    part,
    isCurrent,
    onSelect,
    onUpdate,
    onDelete,
    canDelete,
    className,
}: SidebarPartItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(part.name);

    const handleSave = () => {
        if (editingName.trim()) {
            onUpdate(part.id, { name: editingName.trim() });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditingName(part.name);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div
                className={cn(
                    'group flex items-center gap-1.5 px-2 py-1.5 text-sm transition-all duration-300',
                    className,
                )}
            >
                <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-6 flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleSave}
                >
                    <Check className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleCancel}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'group flex items-center gap-1.5 px-2 py-1.5 text-sm transition-all duration-300',
                isCurrent
                    ? 'bg-secondary hover:bg-secondary/80'
                    : 'hover:bg-muted/60 hover:text-accent-foreground dark:hover:bg-accent/50 h-9',
                className,
            )}
        >
            <button
                className="flex-1 truncate text-left"
                onClick={() => onSelect(part.id)}
                title={part.name}
            >
                {part.name}
            </button>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    'h-6 w-6 shrink-0',
                    !isCurrent && 'opacity-0 group-hover:opacity-100',
                )}
                onClick={() => setIsEditing(true)}
            >
                <Pencil className="h-3 w-3" />
            </Button>
            {canDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'text-destructive h-6 w-6 shrink-0',
                        !isCurrent && 'opacity-0 group-hover:opacity-100',
                    )}
                    onClick={() => onDelete(part.id)}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
