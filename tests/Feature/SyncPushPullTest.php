<?php

use App\Models\Counter;
use App\Models\Part;
use App\Models\Project;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('sync push requires sync token ability', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user, []);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.increment',
                'payload' => ['counter_id' => fake()->uuid()],
            ],
        ],
    ]);

    $response->assertForbidden();
});

test('sync push applies idempotent counter.increment events', function () {
    $user = User::factory()->create();

    $project = Project::factory()->for($user)->create();

    $part = Part::query()->create([
        'project_id' => $project->id,
        'name' => 'Part 1',
        'position' => 0,
    ]);

    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Row Counter',
        'current_value' => 1,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $eventId = fake()->uuid();

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => $eventId,
                'type' => 'counter.increment',
                'payload' => ['counter_id' => $counter->id],
            ],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJson([
            'applied' => 1,
            'duplicate' => 0,
        ]);

    expect($counter->refresh()->current_value)->toBe(2);

    $response2 = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => $eventId,
                'type' => 'counter.increment',
                'payload' => ['counter_id' => $counter->id],
            ],
        ],
    ]);

    $response2
        ->assertOk()
        ->assertJson([
            'applied' => 0,
            'duplicate' => 1,
        ]);

    expect($counter->refresh()->current_value)->toBe(2);
});

test('sync pull returns counters for the authenticated user', function () {
    $user = User::factory()->create();

    $project = Project::factory()->for($user)->create();

    $part = Part::query()->create([
        'project_id' => $project->id,
        'name' => 'Part 1',
        'position' => 0,
    ]);

    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Row Counter',
        'current_value' => 2,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->getJson(route('api.sync.pull'));

    $response
        ->assertOk()
        ->assertJsonPath('counters.0.id', $counter->id)
        ->assertJsonPath('counters.0.current_value', 2);
});
