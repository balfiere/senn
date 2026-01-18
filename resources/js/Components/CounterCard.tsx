import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { rowMatchesPattern } from '@/lib/patterns';
import { cn } from '@/lib/utils';
import { Counter } from '@/types';
import { router } from '@inertiajs/react';
import {
  Link2,
  Link2Off,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  counter: Counter;
}

export function CounterCard({ counter }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleIncrement = () => {
    router.post(
      route('counters.increment', counter.id),
      {},
      { preserveScroll: true },
    );
  };

  const handleDecrement = () => {
    router.post(
      route('counters.decrement', counter.id),
      {},
      { preserveScroll: true },
    );
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this counter?')) {
      router.post(
        route('counters.reset', counter.id),
        {},
        { preserveScroll: true },
      );
    }
  };

  const handleToggleLink = () => {
    router.patch(
      route('counters.update', counter.id),
      {
        is_linked: !counter.is_linked,
      },
      { preserveScroll: true },
    );
  };

  // Ring logic
  const ringSize = 120;
  const ringRadius = 45;
  const ringStrokeWidth = 6;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = counter.reset_at
    ? (counter.current_value / counter.reset_at) * 100
    : 0;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Applicable notes
  const applicableNotes = (counter.comments || []).filter((comment) =>
    rowMatchesPattern(counter.current_value, comment.row_pattern),
  );

  return (
    <div
      className={cn(
        'bg-card text-card-foreground group relative flex aspect-square flex-col gap-3 rounded-xl border p-2 sm:p-4 shadow-xs',
        counter.is_global && 'ring-primary/20 ring-2',
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base leading-none font-semibold tracking-tight">
            {counter.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            {counter.is_global && (
              <span className="text-muted-foreground bg-muted/20 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                Global
              </span>
            )}
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
                'h-8 w-8',
                counter.is_linked ? 'text-primary' : 'text-muted-foreground',
              )}
              onClick={handleToggleLink}
              title={
                counter.is_linked ? 'Linked to global' : 'Unlinked from global'
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
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
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
            <EditCounterDialog
              counter={counter}
              onClose={() => setIsMenuOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-1 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
          onClick={handleDecrement}
          disabled={counter.current_value <= 1}
        >
          <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="relative h-16 w-16 sm:h-[100px] sm:w-[100px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx={50}
              cy={50}
              r={38}
              fill="none"
              stroke="currentColor"
              strokeWidth={ringStrokeWidth}
              className="text-muted/20"
            />
            {/* Progress ring */}
            {counter.reset_at && (
              <circle
                cx={50}
                cy={50}
                r={38}
                fill="none"
                stroke="currentColor"
                strokeWidth={ringStrokeWidth}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={
                  2 * Math.PI * 38 - (progress / 100) * 2 * Math.PI * 38
                }
                className="text-primary transition-all duration-300"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl sm:text-3xl font-bold tracking-tighter">
              {counter.current_value}
            </span>
            {counter.reset_at && (
              <span className="text-muted-foreground text-[10px] sm:text-xs">
                / {counter.reset_at}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
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
                className="bg-muted/30 text-accent-foreground rounded-md p-1.5 text-xs"
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

function EditCounterDialog({
  counter,
  onClose,
}: {
  counter: Counter;
  onClose: () => void;
}) {
  const [name, setName] = useState(counter.name);
  const [resetAt, setResetAt] = useState(counter.reset_at?.toString() || '');
  const [showResetCount, setShowResetCount] = useState(
    counter.show_reset_count,
  );
  const [currentValue, setCurrentValue] = useState(
    counter.current_value.toString(),
  );

  // Row comment form state
  const [newPattern, setNewPattern] = useState('');
  const [newText, setNewText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.patch(
      route('counters.update', counter.id),
      {
        name,
        reset_at: resetAt ? parseInt(resetAt) : null,
        show_reset_count: showResetCount,
        current_value: parseInt(currentValue),
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

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
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_value">Current Value</Label>
          <Input
            id="current_value"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        </div>
        {!counter.is_global && (
          <>
            <div className="space-y-2">
              <Label htmlFor="reset_at">Reset At (Optional)</Label>
              <Input
                id="reset_at"
                type="number"
                value={resetAt}
                onChange={(e) => setResetAt(e.target.value)}
                placeholder="e.g. 10"
              />
              <p className="text-muted-foreground text-xs">
                Automatically reset to 1 after this number.
              </p>
            </div>
            {resetAt && (
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show_reset">Show reset count</Label>
                <Switch
                  id="show_reset"
                  checked={showResetCount}
                  onCheckedChange={setShowResetCount}
                />
              </div>
            )}
          </>
        )}

        {/* row comments section */}
        <div className="space-y-3 border-t pt-6">
          <Label>Row Notes</Label>
          <div className="space-y-2">
            {counter.comments?.map((comment) => (
              <div
                key={comment.id}
                className="bg-muted/30 flex items-start gap-2 rounded-md border p-2 text-sm"
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

          <div className="space-y-2 rounded-md border p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Label className="text-xs">Row(s)</Label>
                <Input
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="1,3,5-10"
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Note</Label>
                <Textarea
                  value={newText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewText(e.target.value)
                  }
                  placeholder="Remind me..."
                  className="min-h-[50px] py-1 text-xs"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full"
              onClick={handleAddComment}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Note
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter className="flex w-full justify-between sm:justify-between">
        {!counter.is_global ? (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={handleDelete}
          >
            Delete
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
