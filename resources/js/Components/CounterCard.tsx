import { Counter, CounterComment } from "@/types";
import { Button } from "@/Components/ui/button";
import { Plus, Minus, RotateCcw, Settings, MessageSquare, Trash2, X } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/Components/ui/sheet";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
    counter: Counter;
}

export function CounterCard({ counter }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);

    // Optimistic UI could be handled here, but trusting Inertia for now.

    const handleIncrement = () => {
        router.post(route('counters.increment', counter.id), {}, { preserveScroll: true });
    };

    const handleDecrement = () => {
        router.post(route('counters.decrement', counter.id), {}, { preserveScroll: true });
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset this counter?")) {
            router.post(route('counters.reset', counter.id), {}, { preserveScroll: true });
        }
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this counter?")) {
            router.delete(route('counters.destroy', counter.id), { preserveScroll: true });
        }
    };

    return (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col gap-4 relative group">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg leading-none tracking-tight">{counter.name}</h3>
                    {counter.is_global && <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md mt-1 inline-block">Global</span>}
                    {counter.is_linked && <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md mt-1 inline-block ml-1">Linked</span>}
                </div>

                <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <EditCounterDialog counter={counter} onClose={() => setIsMenuOpen(false)} />
                </Dialog>
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleDecrement}
                    disabled={counter.current_value <= 0 && false} // Allow negative?
                >
                    <Minus className="h-6 w-6" />
                </Button>

                <div className="text-center min-w-[3ch]">
                    <span className="text-5xl font-bold font-mono tracking-tighter">
                        {counter.current_value}
                    </span>
                    {counter.reset_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Reset at: {counter.reset_at}
                        </div>
                    )}
                    {counter.show_reset_count && (
                        <div className="text-xs text-muted-foreground">
                            Repeats: {counter.reset_count}
                        </div>
                    )}
                </div>

                <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleIncrement}
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            <div className="flex justify-between items-center mt-auto pt-2 border-t text-sm text-muted-foreground">
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset}>
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Reset
                    </Button>
                </div>

                <Sheet open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            <MessageSquare className="h-3 w-3 mr-1.5" />
                            {counter.comments?.length || 0} Notes
                        </Button>
                    </SheetTrigger>
                    <CounterCommentsSheet counter={counter} />
                </Sheet>
            </div>
        </div>
    );
}

function CounterCommentsSheet({ counter }: { counter: Counter }) {
    const [rowPattern, setRowPattern] = useState("");
    const [commentText, setCommentText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('counter_comments.store', counter.id), {
            row_pattern: rowPattern,
            comment_text: commentText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRowPattern("");
                setCommentText("");
            }
        });
    };

    const handleDelete = (commentId: string) => {
        if (confirm("Delete this note?")) {
            router.delete(route('counter_comments.destroy', commentId), { preserveScroll: true });
        }
    };

    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Notes for {counter.name}</SheetTitle>
                <SheetDescription>
                    Add notes for specific rows or patterns (e.g., "Every 4th row", "Row 12").
                </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="row_pattern">Row(s)</Label>
                        <Input
                            id="row_pattern"
                            placeholder="e.g. 10, 20, 30 or Every 6 rows"
                            value={rowPattern}
                            onChange={e => setRowPattern(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment_text">Note</Label>
                        <Textarea
                            id="comment_text"
                            placeholder="Decrease 1 st at each end"
                            value={commentText}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" size="sm">Add Note</Button>
                </form>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase">Existing Notes</h4>
                    {counter.comments && counter.comments.length > 0 ? (
                        <div className="space-y-3">
                            {counter.comments.map(comment => (
                                <div key={comment.id} className="bg-muted/50 rounded-lg p-3 text-sm relative group">
                                    <div className="font-semibold text-foreground mb-1">{comment.row_pattern}</div>
                                    <div className="text-muted-foreground whitespace-pre-wrap">{comment.comment_text}</div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
                    )}
                </div>
            </div>
        </SheetContent>
    );
}

function EditCounterDialog({ counter, onClose }: { counter: Counter, onClose: () => void }) {
    const [name, setName] = useState(counter.name);
    const [resetAt, setResetAt] = useState(counter.reset_at?.toString() || "");
    const [isGlobal, setIsGlobal] = useState(counter.is_global);
    const [isLinked, setIsLinked] = useState(counter.is_linked);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(route('counters.update', counter.id), {
            name,
            reset_at: resetAt ? parseInt(resetAt) : null,
            is_global: isGlobal,
            is_linked: isLinked,
        }, {
            onSuccess: () => onClose()
        });
    };

    const handleDelete = () => {
        if (confirm("Delete this counter?")) {
            router.delete(route('counters.destroy', counter.id), {
                onSuccess: () => onClose()
            });
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Counter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reset_at">Reset At (Optional)</Label>
                    <Input
                        id="reset_at"
                        type="number"
                        value={resetAt}
                        onChange={e => setResetAt(e.target.value)}
                        placeholder="e.g. 10"
                    />
                    <p className="text-xs text-muted-foreground">Automatically reset to 1 after this number.</p>
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is_global">Global Counter</Label>
                    <Switch id="is_global" checked={isGlobal} onCheckedChange={setIsGlobal} />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is_linked">Linked to Global</Label>
                    <Switch id="is_linked" checked={isLinked} onCheckedChange={setIsLinked} />
                </div>
            </form>
            <DialogFooter className="flex justify-between sm:justify-between w-full">
                <Button variant="destructive" size="sm" type="button" onClick={handleDelete}>Delete</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}
