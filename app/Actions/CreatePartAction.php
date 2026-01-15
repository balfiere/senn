<?php

namespace App\Actions;

use App\Models\Part;
use App\Models\Project;

class CreatePartAction
{
    public function execute(Project $project, string $name, ?int $position = null): Part
    {
        if ($position === null) {
            $position = $project->parts()->max('position') + 1;
        }

        return $project->parts()->create([
            'name' => $name,
            'position' => $position,
        ]);
    }
}
