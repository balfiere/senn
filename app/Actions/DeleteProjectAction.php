<?php

namespace App\Actions;

use App\Models\Project;
use Illuminate\Support\Facades\Storage;

class DeleteProjectAction
{
    /**
     * Delete a project and clean up associated resources.
     */
    public function execute(Project $project): bool
    {
        $disk = Storage::disk('patterns');

        // Clean up PDF file
        if ($project->pdf_path && $disk->exists($project->pdf_path)) {
            $disk->delete($project->pdf_path);
        }

        // Clean up Thumbnail
        if ($project->thumbnail_path && $disk->exists($project->thumbnail_path)) {
            $disk->delete($project->thumbnail_path);
        }

        // Delete the project (cascade will handle related records like parts, counters)
        return $project->delete();
    }
}
