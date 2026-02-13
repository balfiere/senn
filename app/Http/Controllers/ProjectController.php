<?php

namespace App\Http\Controllers;

use App\Actions\CreateProjectAction;
use App\Actions\DeleteProjectAction;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\Pdf\PdfThumbnailGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        private PdfThumbnailGenerator $thumbnailGenerator
    ) {}

    /**
     * Display a listing of the user's projects.
     */
    public function index(): Response
    {
        $projects = auth()->user()
            ->projects()
            ->withoutTrashed()
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
            pdfFile: $request->file('pdf_file'),
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
            'parts' => fn ($query) => $query->orderBy('position'),
            'parts.counters' => fn ($query) => $query->orderBy('position'),
            'parts.counters.comments',
            'pdfAnnotations' => fn ($query) => $query->orderBy('page_number')->orderBy('created_at'),
        ]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'parts' => $project->parts,
            'pdfAnnotations' => $project->pdfAnnotations,
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        Gate::authorize('update', $project);

        \Illuminate\Support\Facades\Log::info('Project update started', ['project_id' => $project->id, 'has_file' => $request->hasFile('pdf_file')]);

        $data = $request->validated();

        if ($request->hasFile('pdf_file')) {
            $disk = \Illuminate\Support\Facades\Storage::disk('patterns');
            $cacheDisk = \Illuminate\Support\Facades\Storage::disk('local');
            \Illuminate\Support\Facades\Log::info('File detected', ['original_name' => $request->file('pdf_file')->getClientOriginalName()]);

            // Delete old PDF
            if ($project->pdf_path && $disk->exists($project->pdf_path)) {
                $disk->delete($project->pdf_path);
            }

            // Delete old Thumbnail
            if ($project->thumbnail_path && $disk->exists($project->thumbnail_path)) {
                $disk->delete($project->thumbnail_path);
            }

            // Clear the cached PDF file to force regeneration
            $cachedPdfPath = "pdf-cache/projects/{$project->id}.pdf";
            if ($cacheDisk->exists($cachedPdfPath)) {
                $cacheDisk->delete($cachedPdfPath);
            }

            $path = $request->file('pdf_file')->store('projects/'.$request->user()->id, 'patterns');
            $data['pdf_path'] = $path;

            // Generate thumbnail
            $project->pdf_path = $path; // Temporarily set path for generator
            $thumbnailPath = $this->thumbnailGenerator->generate($project);
            if ($thumbnailPath) {
                $data['thumbnail_path'] = $thumbnailPath;
            }
        }

        $project->update($data);

        return redirect()->back()
            ->with('success', 'Project updated successfully.');
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
