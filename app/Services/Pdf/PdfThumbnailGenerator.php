<?php
namespace App\Services\Pdf;

use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PdfThumbnailGenerator
{
    public function generate(Project $project): ?string
    {
        if (! $project->pdf_path) {
            return null;
        }

        $disk = Storage::disk('patterns');

        if (! $disk->exists($project->pdf_path)) {
            Log::warning('Cannot generate thumbnail: PDF file not found on disk.', [
                'project_id' => $project->id,
                'pdf_path' => $project->pdf_path,
            ]);

            return null;
        }

        $tempPdf = tempnam(sys_get_temp_dir(), 'pdf_');
        $tempThumbnailPath = tempnam(sys_get_temp_dir(), 'thumb_') . '.png';

        try {
            file_put_contents($tempPdf, $disk->get($project->pdf_path));

            $gsPath = $this->findGhostscript();

            // Build the Ghostscript command
            // -dFirstPage=1 -dLastPage=1 ensures only the first page is rendered
            $command = sprintf(
                '%s -dBATCH -dNOPAUSE -dSAFER -sDEVICE=png16m -r150 ' .
                '-dFirstPage=1 -dLastPage=1 ' .
                '-dTextAlphaBits=4 -dGraphicsAlphaBits=4 ' .
                '-sOutputFile=%s %s 2>&1',
                escapeshellcmd($gsPath),
                escapeshellarg($tempThumbnailPath),
                escapeshellarg($tempPdf)
            );

            exec($command, $output, $exitCode);

            if ($exitCode !== 0) {
                throw new \RuntimeException(
                    'Ghostscript failed (exit ' . $exitCode . '): ' . implode("\n", $output)
                );
            }

            if (! file_exists($tempThumbnailPath) || filesize($tempThumbnailPath) === 0) {
                throw new \RuntimeException('Ghostscript produced no output file.');
            }

            $thumbnailName = pathinfo($project->pdf_path, PATHINFO_FILENAME) . '_thumb.png';
            $thumbnailPath = 'projects/' . $project->user_id . '/thumbnails/' . $thumbnailName;

            $disk->put($thumbnailPath, file_get_contents($tempThumbnailPath));

            return $thumbnailPath;

        } catch (\Exception $e) {
            Log::error('Error generating thumbnail with Ghostscript', [
                'message' => $e->getMessage(),
                'project_id' => $project->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;

        } finally {
            // Guaranteed cleanup whether success or failure,
            // replacing the scattered @unlink calls
            if (isset($tempPdf) && file_exists($tempPdf)) {
                unlink($tempPdf);
            }
            if (isset($tempThumbnailPath) && file_exists($tempThumbnailPath)) {
                unlink($tempThumbnailPath);
            }
        }
    }

    private function findGhostscript(): string
    {
        // Alpine's ghostscript package installs as 'gs'
        // This allows overriding via config/env if needed
        $configured = config('services.ghostscript.path');
        if ($configured && file_exists($configured)) {
            return $configured;
        }

        foreach (['gs', '/usr/bin/gs', '/usr/local/bin/gs'] as $candidate) {
            exec('command -v ' . escapeshellarg($candidate) . ' 2>/dev/null', $out, $code);
            if ($code === 0 && ! empty($out[0])) {
                return trim($out[0]);
            }
        }

        throw new \RuntimeException(
            'Ghostscript not found. Install it or set services.ghostscript.path.'
        );
    }
}