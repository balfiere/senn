<?php

namespace App\Http\Controllers;

use App\Actions\CreateCounterAction;
use App\Actions\DecrementCounterAction;
use App\Actions\IncrementCounterAction;
use App\Actions\ResetCounterAction;
use App\Models\Counter;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CounterController extends Controller
{
    public function store(Request $request, Part $part, CreateCounterAction $createCounterAction)
    {
        Gate::authorize('update', $part->project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_global' => ['boolean'],
            'is_linked' => ['boolean'],
            'reset_at' => ['nullable', 'integer', 'min:1'],
        ]);

        $createCounterAction->execute($part, $validated);

        return back();
    }

    public function update(Request $request, Counter $counter)
    {
        Gate::authorize('update', $counter->part->project);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'current_value' => ['sometimes', 'integer'],
            'reset_at' => ['nullable', 'integer', 'min:1'],
            'is_global' => ['boolean'],
            'is_linked' => ['boolean'],
        ]);

        $counter->update($validated);

        return back();
    }

    public function destroy(Counter $counter)
    {
        Gate::authorize('update', $counter->part->project);

        $counter->delete();

        return back();
    }

    public function increment(Counter $counter, IncrementCounterAction $action)
    {
        Gate::authorize('update', $counter->part->project);
        $action->execute($counter);
        return back();
    }

    public function decrement(Counter $counter, DecrementCounterAction $action)
    {
        Gate::authorize('update', $counter->part->project);
        $action->execute($counter);
        return back();
    }

    public function reset(Counter $counter, ResetCounterAction $action)
    {
        Gate::authorize('update', $counter->part->project);
        $action->execute($counter);
        return back();
    }
}
