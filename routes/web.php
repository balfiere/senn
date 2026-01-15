<?php

use App\Http\Controllers\CounterCommentController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('projects.index');
    }

    return Inertia::render('Welcome');
});

// Legacy dashboard route - redirect to projects
Route::get('/dashboard', function () {
    return redirect()->route('projects.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// Project routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Parts
    Route::post('/projects/{project}/parts', [PartController::class, 'store'])->name('parts.store');
    Route::patch('/parts/{part}', [PartController::class, 'update'])->name('parts.update');
    Route::delete('/parts/{part}', [PartController::class, 'destroy'])->name('parts.destroy');

    // Counters
    Route::post('/parts/{part}/counters', [CounterController::class, 'store'])->name('counters.store');
    Route::patch('/counters/{counter}', [CounterController::class, 'update'])->name('counters.update');
    Route::delete('/counters/{counter}', [CounterController::class, 'destroy'])->name('counters.destroy');
    Route::post('/counters/{counter}/increment', [CounterController::class, 'increment'])->name('counters.increment');
    Route::post('/counters/{counter}/decrement', [CounterController::class, 'decrement'])->name('counters.decrement');
    Route::post('/counters/{counter}/reset', [CounterController::class, 'reset'])->name('counters.reset');

    // Counter Comments
    Route::post('/counters/{counter}/comments', [CounterCommentController::class, 'store'])->name('counter_comments.store');
    Route::delete('/comments/{comment}', [CounterCommentController::class, 'destroy'])->name('counter_comments.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
