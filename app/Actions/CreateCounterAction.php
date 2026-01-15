<?php

namespace App\Actions;

use App\Models\Counter;
use App\Models\Part;

class CreateCounterAction
{
    public function execute(Part $part, array $data): Counter
    {
        $position = $part->counters()->max('position') + 1;

        // Force secondary counter defaults
        $data['is_global'] = false;
        $data['is_linked'] = $data['is_linked'] ?? true;

        return $part->counters()->create(array_merge($data, [
            'position' => $position,
        ]));
    }
}
