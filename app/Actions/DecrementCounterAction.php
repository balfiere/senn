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
        if ($counter->current_value > 1) {
            $counter->current_value--;
            $counter->save();
        }
    }
}
