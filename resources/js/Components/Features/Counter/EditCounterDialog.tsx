import { Button } from '@/Components/ui/button';
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { FormField } from '@/Components/ui/form-field';
import { FormGroup } from '@/Components/ui/form-group';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import {
    createCounterCommentLocally,
    deleteCounterCommentLocally,
    deleteCounterLocally,
    updateCounterLocally,
} from '@/lib/offline/repositories/counters';
import { Counter } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EditCounterDialogProps {
    counter: Counter;
    onClose: () => void;
}

export function EditCounterDialog({
    counter,
    onClose,
}: EditCounterDialogProps) {
    const [name, setName] = useState(counter.name);
    const [currentValue, setCurrentValue] = useState(
        counter.current_value.toString(),
    );
    const [resetAt, setResetAt] = useState(counter.reset_at?.toString() || '');
    const [showResetCount, setShowResetCount] = useState(
        counter.show_reset_count,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Row comment form state
    const [newPattern, setNewPattern] = useState('');
    const [newText, setNewText] = useState('');

    const handleDelete = async () => {
        if (confirm('Delete this counter?')) {
            await deleteCounterLocally(counter.id);
            onClose();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateCounterLocally(counter.id, {
                name,
                current_value: parseInt(currentValue) || 0,
                reset_at: resetAt ? parseInt(resetAt) : null,
                show_reset_count: showResetCount,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddComment = async () => {
        if (!newPattern || !newText) return;

        try {
            const newComment = {
                id: crypto.randomUUID(),
                counter_id: counter.id,
                row_pattern: newPattern,
                comment_text: newText,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            };
            await createCounterCommentLocally(newComment);
            setNewPattern('');
            setNewText('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        await deleteCounterCommentLocally(commentId);
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Counter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
                <FormField label="Name" required>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </FormField>
                <FormField label="Current Value" required>
                    <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        required
                    />
                </FormField>
                {!counter.is_global && (
                    <FormGroup title="Auto-Reset Settings">
                        <FormField
                            label="Reset At (Optional)"
                            description="Automatically reset to 1 after this number"
                        >
                            <Input
                                type="number"
                                value={resetAt}
                                onChange={(e) => setResetAt(e.target.value)}
                                placeholder="e.g. 10"
                            />
                        </FormField>
                        <FormField label="Show reset count">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">
                                    Display reset counter in UI
                                </span>
                                <Switch
                                    checked={showResetCount}
                                    onCheckedChange={setShowResetCount}
                                />
                            </div>
                        </FormField>
                    </FormGroup>
                )}

                {/* row comments section */}
                <FormGroup title="Row Notes" className="border-t pt-6">
                    <div className="space-y-2">
                        {counter.comments?.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-muted/30 flex items-start gap-2 rounded-none border p-2 text-sm"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        Row {comment.row_pattern}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {comment.comment_text}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-6 w-6"
                                    onClick={() =>
                                        handleDeleteComment(comment.id)
                                    }
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <FormGroup
                        title="Add New Note"
                        className="rounded-none border p-3"
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <FormField label="Row(s)">
                                <Input
                                    value={newPattern}
                                    onChange={(e) =>
                                        setNewPattern(e.target.value)
                                    }
                                    placeholder="1,3,5-10"
                                />
                            </FormField>
                            <div className="col-span-2">
                                <FormField label="Note">
                                    <Textarea
                                        value={newText}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLTextAreaElement>,
                                        ) => setNewText(e.target.value)}
                                        placeholder="Remind me..."
                                        className="min-h-[50px] py-1"
                                    />
                                </FormField>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-muted/30 h-8 w-full font-light"
                            onClick={handleAddComment}
                        >
                            <Plus className="mr-1 h-3 w-3" /> Add Note
                        </Button>
                    </FormGroup>
                </FormGroup>

                <DialogFooter className="flex w-full justify-between sm:justify-between">
                    {!counter.is_global ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            Delete
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Counter'}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
