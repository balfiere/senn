<?php

namespace App\Actions;

use App\Models\Counter;
use Illuminate\Support\Facades\DB;

class IncrementCounterAction
{
    public function execute(Counter $counter): void
    {
        DB::transaction(function () use ($counter) {
            $this->incrementSingle($counter);

            if ($counter->is_global) {
                // Find linked counters in the same part
                $linkedCounters = $counter->part->counters()
                    ->where('is_linked', true)
                    ->where('id', '!=', $counter->id) // Safety check
                    ->get();

                foreach ($linkedCounters as $linked) {
                    $this->incrementSingle($linked);
                }
            }
        });
    }

    private function incrementSingle(Counter $counter): void
    {
        $counter->current_value++;

        if ($counter->reset_at && $counter->current_value > $counter->reset_at) {
            $counter->current_value = 1;
            $counter->reset_count++;
        }

        $counter->save();
    }
}
