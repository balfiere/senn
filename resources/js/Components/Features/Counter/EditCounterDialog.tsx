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
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { Counter } from '@/types';
import { router, Form } from '@inertiajs/react';
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
    // Row comment form state - kept separate from main counter form
    const [newPattern, setNewPattern] = useState('');
    const [newText, setNewText] = useState('');

    const handleDelete = () => {
        if (confirm('Delete this counter?')) {
            router.delete(route('counters.destroy', counter.id), {
                onSuccess: () => onClose(),
            });
        }
    };

    const handleAddComment = () => {
        if (!newPattern || !newText) return;
        router.post(
            route('counter_comments.store', counter.id),
            {
                row_pattern: newPattern,
                comment_text: newText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewPattern('');
                    setNewText('');
                },
            },
        );
    };

    const handleDeleteComment = (commentId: string) => {
        router.delete(route('counter_comments.destroy', commentId), {
            preserveScroll: true,
        });
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Counter</DialogTitle>
            </DialogHeader>
            <Form
                action={route('counters.update', counter.id)}
                method="patch"
                onSuccess={() => onClose()}
                className="space-y-4 py-4"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField label="Name" error={errors.name} required>
                            <Input
                                name="name"
                                defaultValue={counter.name}
                            />
                        </FormField>
                        <FormField label="Current Value" error={errors.current_value} required>
                            <Input
                                type="number"
                                name="current_value"
                                defaultValue={counter.current_value}
                            />
                        </FormField>
                        {!counter.is_global && (
                            <FormGroup title="Auto-Reset Settings">
                                <FormField
                                    label="Reset At (Optional)"
                                    error={errors.reset_at}
                                    description="Automatically reset to 1 after this number"
                                >
                                    <Input
                                        type="number"
                                        name="reset_at"
                                        defaultValue={counter.reset_at || ''}
                                        placeholder="e.g. 10"
                                    />
                                </FormField>
                                <FormField label="Show reset count">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Display reset counter in UI
                                        </span>
                                        <input
                                            type="hidden"
                                            name="show_reset_count"
                                            value={counter.show_reset_count ? '1' : '0'}
                                        />
                                        <Switch
                                            defaultChecked={counter.show_reset_count}
                                            onCheckedChange={(checked) => {
                                                // Update hidden input value when switch changes
                                                const hiddenInput = document.querySelector('input[name="show_reset_count"]') as HTMLInputElement;
                                                if (hiddenInput) {
                                                    hiddenInput.value = checked ? '1' : '0';
                                                }
                                            }}
                                        />
                                    </div>
                                </FormField>
                            </FormGroup>
                        )}

                        {/* row comments section - kept separate from main form */}
                        <FormGroup title="Row Notes" className="border-t pt-6">
                            <div className="space-y-2">
                                {counter.comments?.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="bg-muted/30 flex items-start gap-2 rounded-none border p-2 text-sm"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold">Row {comment.row_pattern}</p>
                                            <p className="text-muted-foreground">
                                                {comment.comment_text}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-6 w-6"
                                            onClick={() => handleDeleteComment(comment.id)}
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
                                            onChange={(e) => setNewPattern(e.target.value)}
                                            placeholder="1,3,5-10"
                                        />
                                    </FormField>
                                    <div className="col-span-2">
                                        <FormField label="Note">
                                            <Textarea
                                                value={newText}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                    setNewText(e.target.value)
                                                }
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
                                    className="h-8 w-full font-light bg-muted/30"
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
                                    disabled={processing}
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
                                    onClick={onClose}
                                    data-testid="edit-counter-cancel"
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                    data-testid="edit-counter-save"
                                >
                                    {processing ? 'Updating...' : 'Update Counter'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </Form>
        </DialogContent>
    );
}