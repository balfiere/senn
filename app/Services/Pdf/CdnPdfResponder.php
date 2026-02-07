<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;

final class CdnPdfResponder
{
    public function respond(Project $project): RedirectResponse
    {
        // Validate that the project has a PDF path
        if (! $project->pdf_path) {
            abort(404, 'Project has no PDF file');
        }

        // Generate a custom signature for the file path using a shared secret
        $file = $project->pdf_path;
        $expires = now()->addMinutes(10)->timestamp;
        $data = $file.'|'.$expires;

        // Decode the base64 app key to get the actual key for signature
        $appKey = config('app.key');
        if (str_starts_with($appKey, 'base64:')) {
            $decodedKey = base64_decode(substr($appKey, 7));
        } else {
            $decodedKey = $appKey;
        }

        // Use the decoded key for signature
        $signature = hash_hmac('sha256', $data, $decodedKey);

        // Create the URL with custom signature
        $url = sprintf(
            '%s/%s?signature=%s&expires=%d',
            rtrim(config('pdf.cdn_base_url'), '/'),
            ltrim($file, '/'),
            $signature,
            $expires
        );

        return redirect()->away($url);
    }
}
