<?php

namespace App\Actions\Project;

use App\Models\Project;

class ResetStopwatchAction
{
    public function execute(Project $project): void
    {
        $project->update([
            'stopwatch_seconds' => 0,
            'stopwatch_running' => false,
            'stopwatch_started_at' => null,
        ]);
    }
}
