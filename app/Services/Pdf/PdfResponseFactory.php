<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class PdfResponseFactory
{
    public function forProject(Project $project, Request $request): Response
    {
        return match (config('pdf.cache_strategy')) {
            'cdn' => app(CdnPdfResponder::class)->respond($project),
            'local' => app(LocalCachedPdfResponder::class)->respond($project),
            default => abort(500, 'Invalid PDF cache strategy'),
        };
    }
}
