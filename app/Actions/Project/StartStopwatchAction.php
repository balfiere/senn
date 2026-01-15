<?php

namespace App\Actions\Project;

use App\Models\Project;

class StartStopwatchAction
{
    public function execute(Project $project): void
    {
        if ($project->stopwatch_running) {
            return;
        }

        $project->update([
            'stopwatch_running' => true,
            'stopwatch_started_at' => now(),
        ]);
    }
}
