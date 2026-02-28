import {
    Link2,
    Link2Off,
    Minus,
    Plus,
    RotateCcw,
    Settings,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import { Dialog, DialogTrigger } from '@/Components/ui/dialog';
import {
    decrementCounterLocally,
    incrementCounterLocally,
    resetCounterLocally,
    updateCounterLocally,
} from '@/lib/offline/repositories/counters';
import { rowMatchesPattern } from '@/lib/patterns';
import { cn } from '@/lib/utils';
import { Counter } from '@/types';

import { EditCounterDialog } from './EditCounterDialog';
import { ProgressRing } from './ProgressRing';

interface Props {
    counter: Counter;
}

export function CounterCard({ counter }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleIncrement = () => {
        incrementCounterLocally(counter.id);
    };

    const handleDecrement = () => {
        decrementCounterLocally(counter.id);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset this counter?')) {
            resetCounterLocally(counter.id);
        }
    };

    const handleToggleLink = () => {
        updateCounterLocally(counter.id, {
            is_linked: !counter.is_linked,
        });
    };

    // Applicable notes
    const applicableNotes = (counter.comments || []).filter((comment) =>
        rowMatchesPattern(counter.current_value, comment.row_pattern),
    );

    return (
        <div
            className={cn(
                'bg-card text-card-foreground group relative flex h-full min-h-[100cqi] flex-col gap-3 border p-2 hover:shadow-sm sm:p-4',
                counter.is_global && 'ring-primary/20 ring-1',
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base leading-none tracking-tighter">
                        {counter.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2">
                        {counter.show_reset_count && (
                            <span className="text-muted-foreground text-xs">
                                Repeats: {counter.reset_count}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5">
                    {!counter.is_global && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'hidden h-8 w-8 sm:inline-flex',
                                counter.is_linked
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                            )}
                            onClick={handleToggleLink}
                            title={
                                counter.is_linked
                                    ? 'Linked to global'
                                    : 'Unlinked from global'
                            }
                        >
                            {counter.is_linked ? (
                                <Link2 className="h-4 w-4" />
                            ) : (
                                <Link2Off className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hidden h-8 w-8 sm:inline-flex"
                        onClick={handleReset}
                        title="Reset"
                        data-testid={`counter-reset-${counter.id}`}
                    >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-8 w-8"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        {isMenuOpen && (
                            <EditCounterDialog
                                counter={counter}
                                onClose={() => setIsMenuOpen(false)}
                            />
                        )}
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center gap-1 sm:gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-2 transition-all active:scale-90 sm:h-10 sm:w-10"
                    onClick={handleDecrement}
                    disabled={counter.current_value <= 1}
                    data-testid={`counter-decrement-${counter.id}`}
                >
                    <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <ProgressRing
                    current={counter.current_value}
                    total={counter.reset_at}
                    size={undefined} // Use default/responsive from CSS if possible, but keeping same logic as before:
                    className="h-16 w-16 sm:h-[100px] sm:w-[100px]"
                    strokeWidth={6}
                >
                    <span className="font-mono text-xl font-bold tracking-tighter sm:text-3xl">
                        {counter.current_value}
                    </span>
                    {counter.reset_at && (
                        <span className="text-muted-foreground text-[10px] sm:text-xs">
                            / {counter.reset_at}
                        </span>
                    )}
                </ProgressRing>

                <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                    onClick={handleIncrement}
                >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </div>

            <div className="flex flex-col gap-1">
                {/* row notes */}
                {applicableNotes.length > 0 && (
                    <div className="space-y-1">
                        {applicableNotes.slice(0, 2).map((note) => (
                            <div
                                key={note.id}
                                className="bg-muted/30 text-accent-foreground rounded-none p-1.5 text-xs"
                            >
                                {note.comment_text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
