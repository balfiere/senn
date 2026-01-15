<?php

namespace App\Http\Controllers;

use App\Models\Counter;
use App\Models\CounterComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CounterCommentController extends Controller
{
    public function store(Request $request, Counter $counter)
    {
        Gate::authorize('update', $counter->part->project);

        $validated = $request->validate([
            'row_pattern' => ['required', 'string'],
            'comment_text' => ['required', 'string'],
        ]);

        $counter->comments()->create($validated);

        return back();
    }

    public function destroy(CounterComment $comment)
    {
        Gate::authorize('update', $comment->counter->part->project);

        $comment->delete();

        return back();
    }
}
