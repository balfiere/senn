<?php

namespace App\Http\Controllers;

use App\Actions\Project\ResetStopwatchAction;
use App\Actions\Project\StartStopwatchAction;
use App\Actions\Project\StopStopwatchAction;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;

class ProjectStopwatchController extends Controller
{
    public function start(Project $project, StartStopwatchAction $action): RedirectResponse
    {
        $action->execute($project);

        return back();
    }

    public function stop(Project $project, StopStopwatchAction $action): RedirectResponse
    {
        $action->execute($project);

        return back();
    }

    public function reset(Project $project, ResetStopwatchAction $action): RedirectResponse
    {
        $action->execute($project);

        return back();
    }
}
