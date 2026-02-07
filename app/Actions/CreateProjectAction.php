<?php

namespace App\Actions;

use App\Models\Counter;
use App\Models\Part;
use App\Models\Project;
use App\Models\User;
use App\Services\Pdf\PdfThumbnailGenerator;
use Illuminate\Support\Facades\DB;

class CreateProjectAction
{
    public function __construct(
        private PdfThumbnailGenerator $thumbnailGenerator
    ) {}

    /**
     * Create a new project with a default part and global counter.
     */
    public function execute(User $user, string $name, ?\Illuminate\Http\UploadedFile $pdfFile = null): Project
    {
        return DB::transaction(function () use ($user, $name, $pdfFile) {
            $pdfPath = null;

            if ($pdfFile) {
                $pdfPath = $pdfFile->store('projects/'.$user->id, 'patterns');
            }

            // Create the project
            $project = $user->projects()->create([
                'name' => $name,
                'pdf_path' => $pdfPath,
                'stopwatch_seconds' => 0,
                'stopwatch_running' => false,
            ]);

            // Create default part
            $part = $project->parts()->create([
                'name' => 'Part 1',
                'position' => 0,
            ]);

            // Create global counter for the part
            $part->counters()->create([
                'name' => 'Row Counter',
                'current_value' => 1,
                'is_global' => true,
                'is_linked' => false,
                'position' => 0,
            ]);

            if ($pdfPath) {
                $thumbnailPath = $this->thumbnailGenerator->generate($project);
                if ($thumbnailPath) {
                    $project->update(['thumbnail_path' => $thumbnailPath]);
                }
            }

            return $project->fresh(['parts.counters']);
        });
    }
}
