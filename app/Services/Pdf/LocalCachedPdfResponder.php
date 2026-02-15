<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

final class LocalCachedPdfResponder
{
    public function respond(Project $project): Response
    {
        $sourcePath = $project->pdf_path;
        abort_unless((bool) $sourcePath, 404);

        $sourceDisk = Storage::disk('patterns');
        abort_unless($sourceDisk->exists($sourcePath), 404);

        return $sourceDisk->response($sourcePath, null, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'private, max-age=' . config('pdf.cache_ttl'),
        ]);
    }
}
