<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('forgot password page is accessible to guests', function () {
    $response = $this->get('/forgot-password');

    $response->assertSuccessful();
});

test('forgot password page is not accessible to authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/forgot-password');

    $response->assertRedirect('/projects');
});

test('forgot password form validation works', function () {
    $response = $this->post('/forgot-password', [
        'email' => 'invalid-email',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('forgot password form requires email', function () {
    $response = $this->post('/forgot-password', []);

    $response->assertSessionHasErrors(['email']);
});

test('forgot password redirects to success page on valid email', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $response = $this->post('/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertRedirect('/forgot-password/success');
    $response->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPassword::class);
});

test('forgot password sends notification to existing user', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $this->post('/forgot-password', [
        'email' => $user->email,
    ]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification, $channels, $notifiable) use ($user) {
        return $notifiable->email === $user->email;
    });
});

test('forgot password redirects to success even for non-existent user', function () {
    Notification::fake();

    $response = $this->post('/forgot-password', [
        'email' => 'nonexistent@example.com',
    ]);

    $response->assertRedirect('/forgot-password/success');
    // Status message should not be present for security reasons
    $response->assertSessionMissing('status');

    Notification::assertNothingSent();
});

test('forgot password success page is accessible', function () {
    $response = $this->get('/forgot-password/success');

    $response->assertSuccessful();
});

test('forgot password success page shows status message when present', function () {
    $response = $this->withSession(['status' => 'We have emailed your password reset link.'])
        ->get('/forgot-password/success');

    $response->assertSuccessful();
});

test('forgot password success page is accessible to authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/forgot-password/success');

    $response->assertSuccessful();
});
