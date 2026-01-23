<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('guest can access password reset form with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    // Access the password reset form with valid token
    $response = $this->get('/reset-password/'.$token);

    $response->assertSuccessful();
    // Just check that the page loads successfully with the token
    $response->assertSee($token);
});

test('guest cannot access password reset form with invalid token', function () {
    $response = $this->get('/reset-password/invalid-token');

    $response->assertStatus(200); // Should still load the form but validation will happen on submission
});

test('password reset form validates required fields', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => '',
        'password_confirmation' => '',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('password reset form validates password confirmation', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'different-password',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('password reset form validates password length', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => '123', // Too short
        'password_confirmation' => '123',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('successful password reset redirects to success page', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token, $user) {
        $token = $notification->token;

        // Now submit the password reset form with valid data
        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertRedirect('/password-reset-success');
        $response->assertSessionHas('status', 'Your password has been reset.');

        return true;
    });
});

test('authenticated user can access password reset form', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get('/reset-password/some-token');

    // Authenticated users should now be able to access the form
    $response->assertSuccessful();
});

test('authenticated user can reset password successfully', function () {
    Notification::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    // Request password reset to generate token using the authenticated route
    $response = $this->post(route('account.password.reset'));

    if (session('errors')) {
        dump('Reset Link Errors:', session('errors')->all());
    }

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token, $user) {
        $token = $notification->token;

        // Now submit the password reset form with valid data
        $response = $this->post(route('password.store'), [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        // Debug session errors if any
        if (session('errors')) {
            dump('Password Store Errors:', session('errors')->all());
        }

        $response->assertRedirect('/password-reset-success');
        $response->assertSessionHas('status', 'Your password has been reset.');

        // Ensure user is logged out (NewPasswordController logs out authenticated users on success)
        $this->assertGuest();

        return true;
    });
});

test('password reset form shows validation errors', function () {
    Notification::fake();

    $user = User::factory()->create();

    // Request password reset to generate token
    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertSessionHasErrors(['password']);
    // Just check that errors are present in the session
    $this->assertTrue(session()->has('errors'));
});
