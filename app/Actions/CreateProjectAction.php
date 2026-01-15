<?php

namespace App\Actions;

use App\Models\Counter;
use App\Models\Part;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateProjectAction
{
    /**
     * Create a new project with a default part and global counter.
     */
    public function execute(User $user, string $name, ?string $pdfUrl = null): Project
    {
        return DB::transaction(function () use ($user, $name, $pdfUrl) {
            // Create the project
            $project = $user->projects()->create([
                'name' => $name,
                'pdf_url' => $pdfUrl,
                'stopwatch_seconds' => 0,
                'stopwatch_running' => false,
            ]);

            // Create default part
            $part = $project->parts()->create([
                'name' => 'Part 1',
                'position' => 0,
            ]);

            // Create global counter for the part
            $part->counters()->create([
                'name' => 'Row Counter',
                'current_value' => 1,
                'is_global' => true,
                'is_linked' => false,
                'position' => 0,
            ]);

            return $project->fresh(['parts.counters']);
        });
    }
}
