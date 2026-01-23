<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
    $this->actingAs($this->user)
        ->patch('/profile', [
            'email' => 'invalid-email',
        ])
        ->assertSessionHasErrors(['email']);
});

test('email change works', function () {
    $this->actingAs($this->user)
        ->patch('/profile', [
            'name' => $this->user->name,
            'email' => 'new@example.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'email' => 'new@example.com',
    ]);
});

test('password change validation works', function () {
    $this->actingAs($this->user)
        ->put('/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ])
        ->assertSessionHasErrors(['current_password']);
});

test('password change works', function () {
    $this->actingAs($this->user)
        ->put('/password', [
            'current_password' => 'password123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertTrue(Hash::check('newpassword123', $this->user->fresh()->password));
});

test('password reset email can be sent', function () {
    $this->actingAs($this->user)
        ->post('/forgot-password', [
            'email' => $this->user->email,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/projects');
});

test('account deletion requires password confirmation', function () {
    $this->actingAs($this->user)
        ->delete('/profile', [
            'password' => 'wrongpassword',
        ])
        ->assertSessionHasErrors(['password']);
});

test('account deletion works', function () {
    $this->actingAs($this->user)
        ->delete('/profile', [
            'password' => 'password123',
        ])
        ->assertRedirect('/');

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
