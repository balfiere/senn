<?php

namespace App\Http\Controllers\Sync;

use App\Actions\DecrementCounterAction;
use App\Actions\IncrementCounterAction;
use App\Actions\ResetCounterAction;
use App\Models\Counter;
use App\Models\CounterComment;
use App\Models\Part;
use App\Models\Project;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class SyncPushController
{
    public function __construct(
        private readonly IncrementCounterAction $incrementCounterAction,
        private readonly DecrementCounterAction $decrementCounterAction,
        private readonly ResetCounterAction $resetCounterAction,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->currentAccessToken() || !$user->tokenCan('sync')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'events' => ['required', 'array', 'min:1'],
            'events.*.event_id' => ['required', 'uuid'],
            'events.*.type' => ['required', 'string', 'max:100'],
            'events.*.payload' => ['required', 'array'],
        ]);

        $applied = 0;
        $duplicate = 0;
        $errors = [];

        foreach ($validated['events'] as $index => $event) {
            $eventId = $event['event_id'];

            try {
                DB::transaction(function () use ($user, $event, $eventId, &$applied, &$duplicate) {
                    try {
                        DB::table('sync_received_events')->insert([
                            'user_id' => $user->id,
                            'event_id' => $eventId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } catch (QueryException $e) {
                        $duplicate++;

                        return;
                    }

                    $this->applyEvent($user->id, $event['type'], $event['payload']);
                    $applied++;
                });
            } catch (\Throwable $e) {
                $errors[] = [
                    'index' => $index,
                    'event_id' => $eventId,
                    'message' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'applied' => $applied,
            'duplicate' => $duplicate,
            'errors' => $errors,
        ]);
    }

    private function applyEvent(int $userId, string $type, array $payload): void
    {
        match ($type) {
            'counter.increment' => $this->applyCounterIncrement($userId, $payload),
            'counter.decrement' => $this->applyCounterDecrement($userId, $payload),
            'counter.reset' => $this->applyCounterReset($userId, $payload),
            'counter.upsert' => $this->applyCounterUpsert($userId, $payload),
            'counter.delete' => $this->applyCounterDelete($userId, $payload),
            'part.upsert' => $this->applyPartUpsert($userId, $payload),
            'part.delete' => $this->applyPartDelete($userId, $payload),
            'counter_comment.upsert' => $this->applyCounterCommentUpsert($userId, $payload),
            'counter_comment.delete' => $this->applyCounterCommentDelete($userId, $payload),
            'project.upsert' => $this->applyProjectUpsert($userId, $payload),
            default => throw new \InvalidArgumentException("Unsupported event type: {$type}"),
        };
    }

    // ─── Counter operations ───────────────────────────────────────────

    private function resolveCounter(int $userId, string $counterId): Counter
    {
        return Counter::query()
            ->whereKey($counterId)
            ->whereHas('part.project', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();
    }

    private function applyCounterIncrement(int $userId, array $payload): void
    {
        $counter = $this->resolveCounter($userId, $this->requireString($payload, 'counter_id'));
        $this->incrementCounterAction->execute($counter);
    }

    private function applyCounterDecrement(int $userId, array $payload): void
    {
        $counter = $this->resolveCounter($userId, $this->requireString($payload, 'counter_id'));
        $this->decrementCounterAction->execute($counter);
    }

    private function applyCounterReset(int $userId, array $payload): void
    {
        $counter = $this->resolveCounter($userId, $this->requireString($payload, 'counter_id'));
        $this->resetCounterAction->execute($counter);
    }

    private function applyCounterUpsert(int $userId, array $payload): void
    {
        $record = $payload['record'] ?? null;
        if (!is_array($record) || empty($record['id'])) {
            throw new \InvalidArgumentException('Missing record or record.id.');
        }

        // Verify the part belongs to the user
        $partId = $record['part_id'] ?? null;
        if (!$partId) {
            throw new \InvalidArgumentException('Missing record.part_id.');
        }

        Part::query()
            ->whereKey($partId)
            ->whereHas('project', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $existing = Counter::withTrashed()->find($record['id']);

        $attributes = collect($record)->only([
            'part_id',
            'name',
            'current_value',
            'reset_at',
            'reset_count',
            'show_reset_count',
            'is_global',
            'is_linked',
            'position',
        ])->toArray();

        if ($existing) {
            $existing->fill($attributes);
            if ($existing->trashed()) {
                $existing->restore();
            }
            $existing->save();
        } else {
            $counter = new Counter($attributes);
            $counter->id = $record['id'];
            $counter->save();
        }
    }

    private function applyCounterDelete(int $userId, array $payload): void
    {
        $id = $this->requireString($payload, 'id');
        $counter = $this->resolveCounter($userId, $id);
        $counter->delete();
    }

    // ─── Part operations ──────────────────────────────────────────────

    private function applyPartUpsert(int $userId, array $payload): void
    {
        $record = $payload['record'] ?? null;
        if (!is_array($record) || empty($record['id'])) {
            throw new \InvalidArgumentException('Missing record or record.id.');
        }

        $projectId = $record['project_id'] ?? null;
        if (!$projectId) {
            throw new \InvalidArgumentException('Missing record.project_id.');
        }

        Project::query()
            ->whereKey($projectId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $attributes = collect($record)->only(['project_id', 'name', 'position'])->toArray();

        $existing = Part::withTrashed()->find($record['id']);

        if ($existing) {
            $existing->fill($attributes);
            if ($existing->trashed()) {
                $existing->restore();
            }
            $existing->save();
        } else {
            $part = new Part($attributes);
            $part->id = $record['id'];
            $part->save();
        }
    }

    private function applyPartDelete(int $userId, array $payload): void
    {
        $id = $this->requireString($payload, 'id');

        $part = Part::query()
            ->whereKey($id)
            ->whereHas('project', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $part->delete();
    }

    // ─── Counter comment operations ───────────────────────────────────

    private function applyCounterCommentUpsert(int $userId, array $payload): void
    {
        $record = $payload['record'] ?? null;
        if (!is_array($record) || empty($record['id'])) {
            throw new \InvalidArgumentException('Missing record or record.id.');
        }

        $counterId = $record['counter_id'] ?? null;
        if (!$counterId) {
            throw new \InvalidArgumentException('Missing record.counter_id.');
        }

        // Verify ownership chain: counter -> part -> project -> user
        Counter::query()
            ->whereKey($counterId)
            ->whereHas('part.project', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $attributes = collect($record)->only(['counter_id', 'row_pattern', 'comment_text'])->toArray();

        $existing = CounterComment::withTrashed()->find($record['id']);

        if ($existing) {
            $existing->fill($attributes);
            if ($existing->trashed()) {
                $existing->restore();
            }
            $existing->save();
        } else {
            $comment = new CounterComment($attributes);
            $comment->id = $record['id'];
            $comment->save();
        }
    }

    private function applyCounterCommentDelete(int $userId, array $payload): void
    {
        $id = $this->requireString($payload, 'id');

        $comment = CounterComment::query()
            ->whereKey($id)
            ->whereHas('counter.part.project', fn($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $comment->delete();
    }

    private function applyProjectUpsert(int $userId, array $payload): void
    {
        $record = $payload['record'] ?? null;
        if (!is_array($record) || empty($record['id'])) {
            throw new \InvalidArgumentException('Missing record or record.id.');
        }

        $project = Project::withTrashed()
            ->where('id', $record['id'])
            ->where('user_id', $userId)
            ->firstOrFail();

        $project->update(collect($record)->only([
            'name',
            'stopwatch_seconds',
            'stopwatch_running',
            'stopwatch_started_at',
        ])->toArray());
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function requireString(array $payload, string $key): string
    {
        $value = $payload[$key] ?? null;

        if (!is_string($value)) {
            throw new \InvalidArgumentException("Missing {$key}.");
        }

        return $value;
    }
}
