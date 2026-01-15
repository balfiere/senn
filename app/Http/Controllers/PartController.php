<?php

namespace App\Http\Controllers;

use App\Actions\CreatePartAction;
use App\Actions\DeletePartAction;
use App\Actions\UpdatePartAction;
use App\Models\Part;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PartController extends Controller
{
    public function store(Request $request, Project $project, CreatePartAction $createPartAction)
    {
        Gate::authorize('update', $project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $part = $createPartAction->execute($project, $validated['name']);

        return back()->with('success', "Part \"{$part->name}\" created successfully");
    }

    public function update(Request $request, Part $part, UpdatePartAction $updatePartAction)
    {
        Gate::authorize('update', $part->project);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'integer'],
        ]);

        $updatePartAction->execute($part, $validated);

        return back()->with('success', "Part \"{$part->name}\" updated successfully");
    }

    public function destroy(Part $part, DeletePartAction $deletePartAction)
    {
        Gate::authorize('update', $part->project);

        if ($part->project->parts()->count() <= 1) {
            return back()->with('error', 'Each project must have at least one part.');
        }

        $name = $part->name;
        $deletePartAction->execute($part);

        return back()->with('success', "Part \"{$name}\" deleted successfully");
    }
}
