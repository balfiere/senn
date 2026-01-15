<?php

namespace App\Actions;

use App\Models\Counter;

class ResetCounterAction
{
    public function execute(Counter $counter): void
    {
        $counter->current_value = 1;
        $counter->reset_count = 0;
        $counter->save();
    }
}
