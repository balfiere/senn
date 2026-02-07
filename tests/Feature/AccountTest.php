<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);
});

test('account page is accessible to authenticated users', function () {
    $this->actingAs($this->user)
        ->get('/account')
        ->assertSuccessful();
});

test('account page is not accessible to guests', function () {
    $this->get('/account')
        ->assertRedirect('/login');
});

test('email change form validation works', function () {
    if (config('auth.mode') === 'production') {
        $this->actingAs($this->user)
            ->patch('/profile', [
                'name' => $this->user->name,
                'email' => 'invalid-email',
                'password' => 'password123',
            ])
            ->assertSessionHasErrorsIn('defaultProfileInformation', ['email']);
    } else {
        // In simple mode, test username validation instead
        $this->actingAs($this->user)
            ->patch('/profile', [
                'name' => $this->user->name,
                'username' => 'invalid-username!',
                'password' => 'password123',
            ])
            ->assertSessionHasErrorsIn('defaultProfileInformation', ['username']);
    }
});

test('email change works', function () {
    if (config('auth.mode') === 'production') {
        $this->actingAs($this->user)
            ->patch('/profile', [
                'name' => $this->user->name,
                'email' => 'new@example.com',
                'password' => 'password123',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/account');

        $this->assertAuthenticatedAs($this->user);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'email' => 'new@example.com',
            // In production mode with email verification enabled, email_verified_at may be set
        ]);
    } else {
        // In simple mode, test username change instead
        $this->actingAs($this->user)
            ->patch('/profile', [
                'name' => $this->user->name,
                'username' => 'newusername',
                'password' => 'password123',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/account');

        $this->assertAuthenticatedAs($this->user);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'username' => 'newusername',
        ]);
    }
});

test('password change validation works', function () {
    if (config('auth.mode') === 'simple') {
        $this->actingAs($this->user)
            ->put('/password', [
                'current_password' => 'wrongpassword',
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ])
            ->assertSessionHasErrors(['current_password']);
    } else {
        // In production mode, password change is handled by Fortify
        $this->actingAs($this->user)
            ->put('/password', [
                'current_password' => 'wrongpassword',
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ])
            ->assertSessionHasErrors(['current_password']);
    }
});

test('password change works', function () {
    if (config('auth.mode') === 'simple') {
        $this->actingAs($this->user)
            ->put('/password', [
                'current_password' => 'password123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertTrue(Hash::check('newpassword123', $this->user->fresh()->password));
    } else {
        // In production mode, password change is handled by Fortify
        $this->actingAs($this->user)
            ->put('/password', [
                'current_password' => 'password123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertTrue(Hash::check('newpassword123', $this->user->fresh()->password));
    }
});

test('password reset email can be sent', function () {
    if (config('auth.mode') === 'simple') {
        // In simple mode, password reset is not implemented
        $this->actingAs($this->user)
            ->post('/forgot-password', [
                'email' => $this->user->email,
            ])
            ->assertStatus(404);
    } else {
        // In production mode, use Fortify's password reset
        $this->actingAs($this->user)
            ->post('/forgot-password', [
                'email' => $this->user->email,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/projects');
    }
});

test('account deletion requires password confirmation', function () {
    $this->actingAs($this->user)
        ->delete('/profile', [
            'password' => 'wrongpassword',
        ])
        ->assertSessionHasErrors(['password']);
});

test('account deletion works', function () {
    // Create a project with files for the user
    $project = Project::factory()->create([
        'user_id' => $this->user->id,
        'pdf_path' => 'projects/'.$this->user->id.'/test.pdf',
        'thumbnail_path' => 'projects/'.$this->user->id.'/thumbnails/test_thumb.png',
    ]);

    // Create mock files in storage
    Storage::disk('patterns')->put($project->pdf_path, 'test pdf content');
    Storage::disk('patterns')->put($project->thumbnail_path, 'test thumbnail content');

    // Verify files exist before deletion
    $this->assertTrue(Storage::disk('patterns')->exists($project->pdf_path));
    $this->assertTrue(Storage::disk('patterns')->exists($project->thumbnail_path));

    $this->actingAs($this->user)
        ->delete('/profile', [
            'password' => 'password123',
        ])
        ->assertRedirect('/');

    // Verify files are deleted after account deletion
    $this->assertFalse(Storage::disk('patterns')->exists($project->pdf_path));
    $this->assertFalse(Storage::disk('patterns')->exists($project->thumbnail_path));

    // Verify directories are also cleaned up (skip for S3 storage as directory cleanup may not work the same way)
    if (config('filesystems.disks.patterns.driver') !== 's3') {
        $this->assertFalse(Storage::disk('patterns')->exists('projects/'.$this->user->id.'/thumbnails'));
        $this->assertFalse(Storage::disk('patterns')->exists('projects/'.$this->user->id));
    }

    // Verify user is deleted from database
    $this->assertDatabaseMissing('users', [
        'id' => $this->user->id,
    ]);
});

test('logout works', function () {
    $this->actingAs($this->user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});
