<?php

namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PdfThumbnailGenerator
{
    /**
     * Generate a thumbnail for the given project's PDF.
     */
    public function generate(Project $project): ?string
    {
        if (!$project->pdf_path) {
            return null;
        }

        $disk = Storage::disk('patterns');

        if (!$disk->exists($project->pdf_path)) {
            Log::warning("Cannot generate thumbnail: PDF file not found on disk.", [
                'project_id' => $project->id,
                'pdf_path' => $project->pdf_path
            ]);
            return null;
        }

        // Create a temporary file for the PDF if it's not local
        // Imagick needs a local file path to work reliably with Ghostscript
        $tempPdf = tempnam(sys_get_temp_dir(), 'pdf_');
        file_put_contents($tempPdf, $disk->get($project->pdf_path));

        $tempThumbnailPath = tempnam(sys_get_temp_dir(), 'thumb_') . '.png';

        try {
            $imagick = new \Imagick();

            // Set resolution before reading the PDF for better quality
            $imagick->setResolution(150, 150);

            // Read ONLY the first page [0]
            $imagick->readImage($tempPdf . '[0]');

            // Convert to PNG
            $imagick->setImageFormat('png');

            // Flatten if there are alpha channels (common in PDFs)
            $imagick = $imagick->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);

            // Write to temp file
            $imagick->writeImage($tempThumbnailPath);

            // Store the thumbnail
            $thumbnailName = pathinfo($project->pdf_path, PATHINFO_FILENAME) . '_thumb.png';
            $thumbnailPath = 'projects/' . $project->user_id . '/thumbnails/' . $thumbnailName;

            $disk->put($thumbnailPath, file_get_contents($tempThumbnailPath));

            // Cleanup
            @unlink($tempPdf);
            @unlink($tempThumbnailPath);
            $imagick->clear();
            $imagick->destroy();

            return $thumbnailPath;
        } catch (\Exception $e) {
            Log::error("Error generating thumbnail with Imagick", [
                'message' => $e->getMessage(),
                'project_id' => $project->id,
                'trace' => $e->getTraceAsString()
            ]);

            // Cleanup on failure
            if (isset($tempPdf))
                @unlink($tempPdf);
            if (isset($tempThumbnailPath))
                @unlink($tempThumbnailPath);

            return null;
        }
    }
}
