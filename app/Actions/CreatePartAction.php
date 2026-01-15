<?php

namespace App\Actions;

use App\Models\Part;
use App\Models\Project;

use Illuminate\Support\Facades\DB;

class CreatePartAction
{
    public function execute(Project $project, string $name, ?int $position = null): Part
    {
        return DB::transaction(function () use ($project, $name, $position) {
            if ($position === null) {
                $position = $project->parts()->max('position') + 1;
            }

            $part = $project->parts()->create([
                'name' => $name,
                'position' => $position,
            ]);

            // Every part must have exactly one global counter
            $part->counters()->create([
                'name' => 'Global Counter',
                'current_value' => 1,
                'is_global' => true,
                'is_linked' => false,
                'position' => 0,
            ]);

            return $part;
        });
    }
}
