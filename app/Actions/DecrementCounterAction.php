<?php

namespace App\Actions;

use App\Models\Counter;
use Illuminate\Support\Facades\DB;

class DecrementCounterAction
{
    public function execute(Counter $counter): void
    {
        DB::transaction(function () use ($counter) {
            $this->decrementSingle($counter);

            if ($counter->is_global) {
                $linkedCounters = $counter->part->counters()
                    ->where('is_linked', true)
                    ->where('id', '!=', $counter->id)
                    ->get();

                foreach ($linkedCounters as $linked) {
                    $this->decrementSingle($linked);
                }
            }
        });
    }

    private function decrementSingle(Counter $counter): void
    {
        if ($counter->current_value > 1) { // Assuming 1 is the floor for row counters? Or 0? Usually 1.
            $counter->current_value--;
            // Should we handle reverse reset? E.g. going from 1 to 10? Probably not for now.
            // If current_value becomes 0, users might want that (e.g. "cast on" row 0).
            // Let's assume generic integer decrement, but perhaps floor at 0 or 1 if desired.
            // For now, simple decrement.
        } elseif ($counter->current_value == 1 && $counter->reset_count > 0) {
            // Logic for going back a "repeat"?
            // E.g. was 1 (repeat 2), go back -> should be reset_at (repeat 1)
            // This is complex. Let's strict to simple decrement for now unless specified.
            // "increments/decrements the same as the global counter"
            // Let's just do -1.
        }

        // Re-reading requirements: "increments/decrements the same as the global counter"
        // Let's keep it simple: just decrement value.
        // But what if it goes below 1?
        // Let's allow it for now, user can manually set if they want.
        $counter->current_value--;
        $counter->save();
    }
}
