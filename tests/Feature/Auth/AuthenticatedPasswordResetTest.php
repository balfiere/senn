<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('authenticated user can request password reset', function () {
    if (config('auth.mode') === 'simple') {
        $this->markTestSkipped('Password reset is not implemented in simple mode.');
    }

    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->post('/account/password-reset');

    $response->assertRedirect();
    $response->assertSessionHas('success');

    Notification::assertSentTo($user, ResetPassword::class);
});

test('unauthenticated user cannot request password reset via authenticated route', function () {
    if (config('auth.mode') === 'simple') {
        $this->markTestSkipped('Password reset is not implemented in simple mode.');
    }

    $response = $this->post('/account/password-reset');

    $response->assertRedirect('/login');
});

test('password reset email contains correct user information', function () {
    if (config('auth.mode') === 'simple') {
        $this->markTestSkipped('Password reset is not implemented in simple mode.');
    }

    Notification::fake();

    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $this->actingAs($user);

    $this->post('/account/password-reset');

    Notification::assertSentTo($user, ResetPassword::class, function ($notification, $channels, $notifiable) use ($user) {
        return $notifiable->email === $user->email;
    });
});
