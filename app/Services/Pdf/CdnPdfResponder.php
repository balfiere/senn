<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;

final class CdnPdfResponder
{
    public function respond(Project $project): RedirectResponse
    {
        $signedUrl = URL::temporarySignedRoute(
            'projects.pattern.cdn',
            now()->addMinutes(10),
            ['project' => $project->id]
        );

        return redirect()->away(
            config('pdf.cdn_base_url') . '/pdf?' . parse_url($signedUrl, PHP_URL_QUERY)
        );
    }
}
