<?php

use App\Models\User;

test('guest cannot create a sync token', function () {
    $response = $this->postJson(route('sync.token'), [
        'device_name' => 'test-device',
    ]);

    $response->assertUnauthorized();
});

test('authenticated user can create a sync token', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('sync.token'), [
        'device_name' => 'test-device',
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['token']);
});
