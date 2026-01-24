<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\Project;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        try {
            app(UpdateUserProfileInformation::class)->update(
                $request->user(),
                $request->only(['name', 'email', 'password'])
            );

            return Redirect::route('account')->with('status', 'profile-information-updated');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors(), 'defaultProfileInformation')->withInput();
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $userId = $user->id;

        // Load user's projects before deletion to get file paths
        $userProjects = $user->projects()->get();

        // Delete all project files first
        $fileCleanupSuccess = true;
        try {
            foreach ($userProjects as $project) {
                $this->cleanupProjectFiles($project);
            }
            
            // Clean up any remaining empty user directories
            $this->cleanUserDirectories($userId);
        } catch (\Exception $e) {
            $fileCleanupSuccess = false;
            // Log file cleanup failures but continue with account deletion
            Log::error('Failed to cleanup user files during account deletion', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }

        // Now delete the user (cascade will handle related records)
        $deleted = false;
        $deletionException = null;
        
        try {
            $deleted = $user->delete();
        } catch (\Exception $e) {
            $deletionException = $e;
            Log::error('User deletion failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        // Log the result for debugging
        Log::info('User deletion attempted', [
            'user_id' => $user->id,
            'deletion_result' => $deleted,
            'user_exists_after' => $user->exists,
            'deletion_exception' => $deletionException ? $deletionException->getMessage() : null,
            'file_cleanup_success' => $fileCleanupSuccess
        ]);

        // Only proceed with logout if deletion was successful
        if ($deleted) {
            try {
                Log::info('Starting logout process', ['user_id' => $user->id]);
                Auth::logout();
                Log::info('Session invalidation started', ['user_id' => $user->id]);
                $request->session()->invalidate();
                Log::info('Session regeneration started', ['user_id' => $user->id]);
                $request->session()->regenerateToken();
                Log::info('Logout process completed successfully', ['user_id' => $user->id]);
            } catch (\Exception $e) {
                Log::error('Logout session cleanup failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        } else {
            Log::warning('Skipping logout due to failed deletion', ['user_id' => $user->id]);
        }

        Log::info('ProfileController::destroy ending', ['user_id' => $user->id]);
        return Redirect::to('/');
    }

    /**
     * Clean up individual project files.
     */
    private function cleanupProjectFiles(Project $project): void
    {
        $disk = Storage::disk('patterns');

        // Clean up PDF file
        if ($project->pdf_path && $disk->exists($project->pdf_path)) {
            $disk->delete($project->pdf_path);
        }

        // Clean up Thumbnail
        if ($project->thumbnail_path && $disk->exists($project->thumbnail_path)) {
            $disk->delete($project->thumbnail_path);
        }

        // Clean up empty directories after file deletion
        $this->cleanEmptyDirectories($project);
    }

    /**
     * Clean up empty directories after project files are deleted.
     */
    private function cleanEmptyDirectories(Project $project): void
    {
        $disk = Storage::disk('patterns');

        // Get directory paths from file paths
        $directories = [];

        if ($project->pdf_path) {
            $pdfDir = dirname($project->pdf_path);
            if ($pdfDir !== '.') {
                $directories[] = $pdfDir;
            }
        }

        if ($project->thumbnail_path) {
            $thumbnailDir = dirname($project->thumbnail_path);
            if ($thumbnailDir !== '.' && !in_array($thumbnailDir, $directories)) {
                $directories[] = $thumbnailDir;
            }
        }

        // Sort directories by depth (deepest first) to ensure proper cleanup
        usort($directories, function($a, $b) {
            return substr_count($b, '/') - substr_count($a, '/');
        });

        // Remove empty directories
        foreach ($directories as $directory) {
            if ($disk->exists($directory) && empty($disk->files($directory)) && empty($disk->directories($directory))) {
                $disk->deleteDirectory($directory);
            }
        }
    }

    /**
     * Clean up any remaining empty user directories after all projects are deleted.
     */
    private function cleanUserDirectories(int $userId): void
    {
        $disk = \Illuminate\Support\Facades\Storage::disk('patterns');
        $userDirectory = "projects/{$userId}";

        // Check if user directory exists and is empty
        if ($disk->exists($userDirectory)) {
            $files = $disk->files($userDirectory);
            $subdirs = $disk->directories($userDirectory);

            if (empty($files) && empty($subdirs)) {
                $disk->deleteDirectory($userDirectory);
            }
        }
    }
}
