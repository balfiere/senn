<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\URL;

test('email verification screen can be rendered', function () {
    if (config('auth.mode') === 'simple') {
        $this->markTestSkipped('Email verification is not implemented in simple mode.');
    }

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    if (config('auth.mode') === 'production') {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        // Check if the user is now verified
        expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
        $response
            ->assertRedirect()
            ->assertRedirectContains('verified=1');
    } else {
        // In simple mode, email verification is not implemented
        if (! Route::has('verification.verify')) {
            $this->markTestSkipped('Email verification routes are not defined in simple mode.');
        }

        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        // Should return 404 since email verification is not implemented in simple mode
        $response->assertStatus(404);
    }
});

test('email is not verified with invalid hash', function () {
    if (config('auth.mode') === 'simple') {
        $this->markTestSkipped('Email verification is not implemented in simple mode.');
    }

    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});
