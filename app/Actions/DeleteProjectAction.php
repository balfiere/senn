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
        // Clean up PDF file from storage if it exists
        if ($project->pdf_url) {
            $this->deletePdfFile($project->pdf_url);
        }

        // Delete the project (cascade will handle related records)
        return $project->delete();
    }

    /**
     * Delete the PDF file from storage.
     */
    protected function deletePdfFile(string $pdfUrl): void
    {
        // Check if the URL is a local storage path
        $disk = Storage::disk(config('filesystems.default'));

        // Extract the path from the URL if it's a full URL
        $path = $this->extractPathFromUrl($pdfUrl);

        if ($path && $disk->exists($path)) {
            $disk->delete($path);
        }
    }

    /**
     * Extract the storage path from a URL.
     */
    protected function extractPathFromUrl(string $url): ?string
    {
        // If it's already a relative path, return as-is
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            return $url;
        }

        // Try to extract path from storage URL
        $storagePath = '/storage/';
        $position = strpos($url, $storagePath);

        if ($position !== false) {
            return substr($url, $position + strlen($storagePath));
        }

        return null;
    }
}
