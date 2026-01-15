<?php

namespace App\Http\Controllers;

use App\Actions\CreateProjectAction;
use App\Actions\DeleteProjectAction;
use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the user's projects.
     */
    public function index(): Response
    {
        $projects = auth()->user()
            ->projects()
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(StoreProjectRequest $request, CreateProjectAction $action): RedirectResponse
    {
        $project = $action->execute(
            user: $request->user(),
            name: $request->validated('name'),
            pdfUrl: $request->validated('pdf_url'),
        );

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        $project->load([
            'parts' => fn($query) => $query->orderBy('position'),
            'parts.counters' => fn($query) => $query->orderBy('position'),
            'parts.counters.comments',
        ]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'parts' => $project->parts,
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project, DeleteProjectAction $action): RedirectResponse
    {
        Gate::authorize('delete', $project);

        $action->execute($project);

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}
