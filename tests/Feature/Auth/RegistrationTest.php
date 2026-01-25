<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $data = [
        'name' => 'Test User',
        'password' => 'password',
        'password_confirmation' => 'password',
    ];

    if (config('auth.mode') === 'simple') {
        $data['username'] = 'testuser';
        $targetRoute = '/dashboard'; // SimpleAuthController returns redirect()->intended('/dashboard')
    } else {
        $data['email'] = 'test@example.com';
        $targetRoute = route('register.success', absolute: false);
    }

    $response = $this->post('/register', $data);

    $this->assertAuthenticated();
    $response->assertRedirect($targetRoute);
});
