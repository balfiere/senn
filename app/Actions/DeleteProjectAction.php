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

        // Clean up empty directories after file deletion
        $this->cleanEmptyDirectories($project);

        // Delete the project (cascade will handle related records like parts, counters)
        return $project->delete();
    }

    /**
     * Clean up empty directories after project files are deleted.
     */
    private function cleanEmptyDirectories(Project $project): void
    {
        $disk = Storage::disk('patterns');

        // Get directory paths from file paths
        $directories = [];

        if ($project->pdf_path) {
            $pdfDir = dirname($project->pdf_path);
            if ($pdfDir !== '.') {
                $directories[] = $pdfDir;
            }
        }

        if ($project->thumbnail_path) {
            $thumbnailDir = dirname($project->thumbnail_path);
            if ($thumbnailDir !== '.' && !in_array($thumbnailDir, $directories)) {
                $directories[] = $thumbnailDir;
            }
        }

        // Sort directories by depth (deepest first) to ensure proper cleanup
        usort($directories, function($a, $b) {
            return substr_count($b, '/') - substr_count($a, '/');
        });

        // Remove empty directories
        foreach ($directories as $directory) {
            if ($disk->exists($directory) && empty($disk->files($directory)) && empty($disk->directories($directory))) {
                $disk->deleteDirectory($directory);
            }
        }
    }
}
