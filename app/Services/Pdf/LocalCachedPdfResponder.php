<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class LocalCachedPdfResponder
{
    public function respond(Project $project): BinaryFileResponse
    {
        $sourcePath = $project->pdf_path;
        abort_unless($sourcePath, 404);

        $cachePath = "pdf-cache/projects/{$project->id}.pdf";
        $cacheDisk = Storage::disk('local');
        $sourceDisk = Storage::disk('patterns');

        if (!$cacheDisk->exists($cachePath)) {
            // Ensure source exists before trying to cache it
            abort_unless($sourceDisk->exists($sourcePath), 404);

            $cacheDisk->put(
                $cachePath,
                $sourceDisk->get($sourcePath)
            );
        }

        return response()->file(
            $cacheDisk->path($cachePath),
            [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'private, max-age=' . config('pdf.cache_ttl'),
            ]
        );
    }
}
