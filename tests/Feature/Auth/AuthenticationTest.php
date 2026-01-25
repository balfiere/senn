<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $identifier = config('auth.mode') === 'simple' ? 'username' : 'email';

    $response = $this->post('/login', [
        $identifier => $user->{$identifier},
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $target = config('auth.mode') === 'simple' ? '/dashboard' : route('projects.index', absolute: false);
    $response->assertRedirect($target);
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $identifier = config('auth.mode') === 'simple' ? 'username' : 'email';

    $this->post('/login', [
        $identifier => $user->{$identifier},
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
