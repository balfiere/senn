<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\Project;
use App\Notifications\PasswordChanged;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
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
     * Display the user's account page.
     */
    public function account(Request $request): Response
    {
        // Get OIDC identities for the user
        $oidcIdentities = $request->user()->oidcIdentities()->get(['provider', 'email'])->keyBy('provider');

        // Build list of linked providers with their identity info
        $linkedProviders = [];
        foreach (config('oidc.providers', []) as $slug => $provider) {
            $identity = $oidcIdentities->get($slug);
            $linkedProviders[] = [
                'slug' => $slug,
                'name' => $provider['name'],
                'linked' => $identity !== null,
                'email' => $identity?->email,
            ];
        }

        return Inertia::render('Account', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'username' => $request->user()->username,
                    'has_password' => ! empty($request->user()->password),
                ],
            ],
            'authMode' => config('auth.mode'),
            'status' => session('status'),
            'oidc' => [
                'enabled' => config('oidc.enabled', false),
                'providers' => $linkedProviders,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        try {
            $data = ['name', 'password'];

            if (config('auth.mode') === 'simple') {
                $data[] = 'username';
            } else {
                $data[] = 'email';
            }

            app(UpdateUserProfileInformation::class)->update(
                $request->user(),
                $request->only($data)
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
        $user = $request->user();
        $hasPassword = ! empty($user->password);

        // Validate based on whether user has a password
        if ($hasPassword) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        } else {
            // OIDC-only user: require username confirmation
            $request->validate([
                'username' => ['required', 'string', 'in:'.$user->username],
            ], [
                'username.in' => 'The username you entered does not match your account.',
            ]);
        }

        $userId = $user->id;

        $userProjects = $user->projects()->get();

        foreach ($userProjects as $project) {
            try {
                $this->cleanupProjectFiles($project);
            } catch (\Exception $e) {
                Log::error('Failed to cleanup project files', [
                    'user_id' => $userId,
                    'project_id' => $project->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->cleanUserDirectories($userId);

        // Logout FIRST to release the user reference from the auth guard
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Now delete the user (cascade will handle related records)
        $user->delete();

        return Redirect::to('/');
    }

    /**
     * Clean up project files when a project is deleted.
     */
    private function cleanupProjectFiles(Project $project): void
    {
        $disk = Storage::disk('patterns');

        // Delete PDF file if it exists
        if ($project->pdf_path && $disk->exists($project->pdf_path)) {
            $disk->delete($project->pdf_path);
        }

        // Delete thumbnail file if it exists
        if ($project->thumbnail_path && $disk->exists($project->thumbnail_path)) {
            $disk->delete($project->thumbnail_path);
        }

        // Clean up empty directories
        $this->cleanEmptyDirectories($project);
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();
        $hasPassword = ! empty($user->password);

        // If user has a password, require current_password validation
        if ($hasPassword) {
            $validated = $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);

            // Logout other devices when password changes
            Auth::logoutOtherDevices($validated['current_password']);
        } else {
            // OIDC-only user setting a password for the first time
            $validated = $request->validate([
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->notify(new PasswordChanged);

        return back()->with('status', 'password-updated');
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
            if ($thumbnailDir !== '.' && ! in_array($thumbnailDir, $directories)) {
                $directories[] = $thumbnailDir;
            }
        }

        // Sort directories by depth (deepest first) to ensure proper cleanup
        usort($directories, function ($a, $b) {
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
        $disk = Storage::disk('patterns');
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
