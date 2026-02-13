<?php

namespace App\Http\Controllers\Sync;

use App\Actions\IncrementCounterAction;
use App\Models\Counter;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class SyncPushController
{
    public function __construct(
        private readonly IncrementCounterAction $incrementCounterAction,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->currentAccessToken() || ! $user->tokenCan('sync')) {
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
                DB::table('sync_received_events')->insert([
                    'user_id' => $user->id,
                    'event_id' => $eventId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (QueryException $e) {
                $duplicate++;

                continue;
            }

            try {
                $this->applyEvent($user->id, $event['type'], $event['payload']);
                $applied++;
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
            default => throw new \InvalidArgumentException('Unsupported event type.'),
        };
    }

    private function applyCounterIncrement(int $userId, array $payload): void
    {
        $counterId = $payload['counter_id'] ?? null;

        if (! is_string($counterId)) {
            throw new \InvalidArgumentException('Missing counter_id.');
        }

        $counter = Counter::query()
            ->whereKey($counterId)
            ->whereHas('part.project', fn ($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $this->incrementCounterAction->execute($counter);
    }
}
