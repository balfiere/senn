<?php

use App\Models\Counter;
use App\Models\CounterComment;
use App\Models\Part;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Str;
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

test('sync push applies counter.decrement events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);
    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Counter',
        'current_value' => 5,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.decrement',
                'payload' => ['counter_id' => $counter->id],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect($counter->refresh()->current_value)->toBe(4);
});

test('sync push applies counter.reset events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);
    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Counter',
        'current_value' => 10,
        'reset_at' => null,
        'reset_count' => 3,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.reset',
                'payload' => ['counter_id' => $counter->id],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect($counter->refresh()->current_value)->toBe(1);
    expect($counter->reset_count)->toBe(0);
});

test('sync push applies part.upsert events for create and update', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    Sanctum::actingAs($user, ['sync']);

    $partId = (string) Str::uuid();

    // Create
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'part.upsert',
                'payload' => [
                    'record' => [
                        'id' => $partId,
                        'project_id' => $project->id,
                        'name' => 'New Part',
                        'position' => 0,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    $part = Part::find($partId);
    expect($part)->not->toBeNull();
    expect($part->name)->toBe('New Part');

    // Update
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'part.upsert',
                'payload' => [
                    'record' => [
                        'id' => $partId,
                        'project_id' => $project->id,
                        'name' => 'Updated Part',
                        'position' => 1,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect($part->refresh()->name)->toBe('Updated Part');
    expect($part->position)->toBe(1);
});

test('sync push applies part.delete events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'part.delete',
                'payload' => ['id' => $part->id],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect(Part::find($part->id))->toBeNull();
    expect(Part::withTrashed()->find($part->id))->not->toBeNull();
});

test('sync push applies counter.upsert events for create and update', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);

    Sanctum::actingAs($user, ['sync']);

    $counterId = (string) Str::uuid();

    // Create
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.upsert',
                'payload' => [
                    'record' => [
                        'id' => $counterId,
                        'part_id' => $part->id,
                        'name' => 'My Counter',
                        'current_value' => 1,
                        'reset_at' => null,
                        'reset_count' => 0,
                        'show_reset_count' => false,
                        'is_global' => false,
                        'is_linked' => true,
                        'position' => 0,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    $counter = Counter::find($counterId);
    expect($counter)->not->toBeNull();
    expect($counter->name)->toBe('My Counter');

    // Update
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.upsert',
                'payload' => [
                    'record' => [
                        'id' => $counterId,
                        'part_id' => $part->id,
                        'name' => 'Updated Counter',
                        'current_value' => 5,
                        'reset_at' => null,
                        'reset_count' => 0,
                        'show_reset_count' => false,
                        'is_global' => false,
                        'is_linked' => true,
                        'position' => 0,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect($counter->refresh()->name)->toBe('Updated Counter');
    expect($counter->current_value)->toBe(5);
});

test('sync push applies counter.delete events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);
    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Counter',
        'current_value' => 1,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter.delete',
                'payload' => ['id' => $counter->id],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect(Counter::find($counter->id))->toBeNull();
    expect(Counter::withTrashed()->find($counter->id))->not->toBeNull();
});

test('sync push applies counter_comment.upsert events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);
    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Counter',
        'current_value' => 1,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);

    Sanctum::actingAs($user, ['sync']);

    $commentId = (string) Str::uuid();

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter_comment.upsert',
                'payload' => [
                    'record' => [
                        'id' => $commentId,
                        'counter_id' => $counter->id,
                        'row_pattern' => '5',
                        'comment_text' => 'Increase stitch count here',
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    $comment = CounterComment::find($commentId);
    expect($comment)->not->toBeNull();
    expect($comment->comment_text)->toBe('Increase stitch count here');
});

test('sync push applies counter_comment.delete events', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $part = Part::query()->create(['project_id' => $project->id, 'name' => 'Part 1', 'position' => 0]);
    $counter = Counter::query()->create([
        'part_id' => $part->id,
        'name' => 'Counter',
        'current_value' => 1,
        'reset_at' => null,
        'reset_count' => 0,
        'show_reset_count' => false,
        'is_global' => false,
        'is_linked' => false,
        'position' => 0,
    ]);
    $comment = CounterComment::query()->create([
        'counter_id' => $counter->id,
        'row_pattern' => '3',
        'comment_text' => 'To be deleted',
    ]);

    Sanctum::actingAs($user, ['sync']);

    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'counter_comment.delete',
                'payload' => ['id' => $comment->id],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    expect(CounterComment::find($comment->id))->toBeNull();
    expect(CounterComment::withTrashed()->find($comment->id))->not->toBeNull();
});

test('sync push applies project.upsert events for stopwatch', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'stopwatch_seconds' => 10,
        'stopwatch_running' => false,
        'stopwatch_started_at' => null,
    ]);

    Sanctum::actingAs($user, ['sync']);

    // Start stopwatch
    $startedAt = now()->toIso8601String();
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'project.upsert',
                'payload' => [
                    'record' => [
                        'id' => $project->id,
                        'stopwatch_running' => true,
                        'stopwatch_started_at' => $startedAt,
                        'stopwatch_seconds' => 10,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    $project->refresh();
    expect($project->stopwatch_running)->toBeTrue();
    expect($project->stopwatch_started_at->toIso8601String())->toBe($startedAt);

    // Stop and update seconds
    $response = $this->postJson(route('api.sync.push'), [
        'events' => [
            [
                'event_id' => fake()->uuid(),
                'type' => 'project.upsert',
                'payload' => [
                    'record' => [
                        'id' => $project->id,
                        'stopwatch_running' => false,
                        'stopwatch_started_at' => null,
                        'stopwatch_seconds' => 25,
                    ]
                ],
            ]
        ],
    ]);

    $response->assertOk()->assertJson(['applied' => 1]);
    $project->refresh();
    expect($project->stopwatch_running)->toBeFalse();
    expect($project->stopwatch_seconds)->toBe(25);
    expect($project->stopwatch_started_at)->toBeNull();
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
