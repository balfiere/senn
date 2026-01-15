import { Counter, CounterComment } from "@/types";
import { Button } from "@/Components/ui/button";
import { Plus, Minus, RotateCcw, Settings, Trash2, X, Link2, Link2Off } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { cn } from "@/lib/utils";
import { rowMatchesPattern } from "@/lib/patterns";

interface Props {
    counter: Counter;
}

export function CounterCard({ counter }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const handleToggleLink = () => {
        router.patch(route('counters.update', counter.id), {
            is_linked: !counter.is_linked
        }, { preserveScroll: true });
    };

    // Ring logic
    const ringSize = 120;
    const ringRadius = 45;
    const ringStrokeWidth = 6;
    const circumference = 2 * Math.PI * ringRadius;
    const progress = counter.reset_at ? (counter.current_value / counter.reset_at) * 100 : 0;
    const progressOffset = circumference - (progress / 100) * circumference;

    // Applicable notes
    const applicableNotes = (counter.comments || []).filter(comment =>
        rowMatchesPattern(counter.current_value, comment.row_pattern)
    );

    return (
        <div className={cn(
            "bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col gap-4 relative group",
            counter.is_global && "ring-2 ring-primary/20"
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg leading-none tracking-tight">{counter.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        {counter.is_global && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">Global</span>}
                        {counter.show_reset_count && (
                            <span className="text-xs text-muted-foreground">Repeats: {counter.reset_count}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5">
                    {!counter.is_global && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", counter.is_linked ? "text-primary" : "text-muted-foreground")}
                            onClick={handleToggleLink}
                            title={counter.is_linked ? "Linked to global" : "Unlinked from global"}
                        >
                            {counter.is_linked ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={handleReset}
                        title="Reset"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <EditCounterDialog counter={counter} onClose={() => setIsMenuOpen(false)} />
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={handleDecrement}
                    disabled={counter.current_value <= 1}
                >
                    <Minus className="h-5 w-5" />
                </Button>

                <div className="relative" style={{ width: ringSize, height: ringSize }}>
                    <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${ringSize} ${ringSize}`}>
                        {/* Background ring */}
                        <circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={ringRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={ringStrokeWidth}
                            className="text-muted/20"
                        />
                        {/* Progress ring */}
                        {counter.reset_at && (
                            <circle
                                cx={ringSize / 2}
                                cy={ringSize / 2}
                                r={ringRadius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={ringStrokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={progressOffset}
                                className="text-primary transition-all duration-300"
                            />
                        )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold font-mono tracking-tighter">
                            {counter.current_value}
                        </span>
                        {counter.reset_at && (
                            <span className="text-xs text-muted-foreground mt-1">
                                / {counter.reset_at}
                            </span>
                        )}
                    </div>
                </div>

                <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={handleIncrement}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
                {/* row notes */}
                {applicableNotes.length > 0 && (
                    <div className="space-y-1">
                        {applicableNotes.map(note => (
                            <div key={note.id} className="bg-accent/50 text-accent-foreground p-2 rounded-md text-sm">
                                {note.comment_text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EditCounterDialog({ counter, onClose }: { counter: Counter, onClose: () => void }) {
    const [name, setName] = useState(counter.name);
    const [resetAt, setResetAt] = useState(counter.reset_at?.toString() || "");
    const [showResetCount, setShowResetCount] = useState(counter.show_reset_count);
    const [currentValue, setCurrentValue] = useState(counter.current_value.toString());

    // Row comment form state
    const [newPattern, setNewPattern] = useState("");
    const [newText, setNewText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(route('counters.update', counter.id), {
            name,
            reset_at: resetAt ? parseInt(resetAt) : null,
            show_reset_count: showResetCount,
            current_value: parseInt(currentValue),
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

    const handleAddComment = () => {
        if (!newPattern || !newText) return;
        router.post(route('counter_comments.store', counter.id), {
            row_pattern: newPattern,
            comment_text: newText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewPattern("");
                setNewText("");
            }
        });
    };

    const handleDeleteComment = (commentId: string) => {
        router.delete(route('counter_comments.destroy', commentId), {
            preserveScroll: true
        });
    };

    return (
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Edit Counter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current_value">Current Value</Label>
                    <Input id="current_value" type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} />
                </div>
                {!counter.is_global && (
                    <>
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
                        {resetAt && (
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="show_reset">Show reset count</Label>
                                <Switch id="show_reset" checked={showResetCount} onCheckedChange={setShowResetCount} />
                            </div>
                        )}
                    </>
                )}

                {/* row comments section */}
                <div className="space-y-3 pt-6 border-t">
                    <Label>Row Notes</Label>
                    <div className="space-y-2">
                        {counter.comments?.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2 rounded-md border p-2 text-sm bg-muted/30">
                                <div className="flex-1">
                                    <p className="font-semibold">Row {comment.row_pattern}</p>
                                    <p className="text-muted-foreground">{comment.comment_text}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 p-3 border rounded-md">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <Label className="text-xs">Row(s)</Label>
                                <Input value={newPattern} onChange={e => setNewPattern(e.target.value)} placeholder="1,3,5-10" className="h-8 text-xs" />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs">Note</Label>
                                <Textarea
                                    value={newText}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewText(e.target.value)}
                                    placeholder="Remind me..."
                                    className="min-h-[50px] text-xs py-1"
                                />
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="w-full h-8" onClick={handleAddComment}>
                            <Plus className="h-3 w-3 mr-1" /> Add Note
                        </Button>
                    </div>
                </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between w-full">
                {!counter.is_global ? (
                    <Button variant="destructive" size="sm" type="button" onClick={handleDelete}>Delete</Button>
                ) : <div></div>}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" onClick={handleSubmit}>Save Changes</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}
