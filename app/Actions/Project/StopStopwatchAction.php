<?php

namespace App\Actions\Project;

use App\Models\Project;

class StopStopwatchAction
{
    public function execute(Project $project): void
    {
        if (! $project->stopwatch_running) {
            return;
        }

        $startedAt = $project->stopwatch_started_at;
        $now = now();
        $elapsed = $startedAt ? (int) $now->diffInSeconds($startedAt, true) : 0;

        $project->update([
            'stopwatch_seconds' => (int) $project->stopwatch_seconds + $elapsed,
            'stopwatch_running' => false,
            'stopwatch_started_at' => null,
        ]);
    }
}
