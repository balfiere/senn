<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\Pdf\PdfResponseFactory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

final class PatternController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the project's PDF pattern.
     */
    public function show(Project $project, Request $request)
    {
        $this->authorize('view', $project);

        if (! $project->pdf_path) {
            abort(404);
        }

        return app(PdfResponseFactory::class)
            ->forProject($project, $request);
    }

    /**
     * Display the thumbnail for the project's PDF.
     */
    public function thumbnail(Project $project)
    {
        $this->authorize('view', $project);

        if (! $project->thumbnail_path) {
            abort(404);
        }

        $disk = \Illuminate\Support\Facades\Storage::disk('patterns');

        if (! $disk->exists($project->thumbnail_path)) {
            abort(404);
        }

        return response($disk->get($project->thumbnail_path))
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    /**
     * Handle CDN signature generation.
     */
    public function cdnSignature(Project $project, Request $request)
    {
        // This is used by the CdnPdfResponder
        if (! $request->hasValidSignature()) {
            abort(401);
        }

        // The CdnPdfResponder handles the logic, this route just needs to exist
        // to be signable. Actually, the Responder redirects to the CDN.
        // This endpoint should ideally return the info or just be the target.
        abort(404);
    }
}
