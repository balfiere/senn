<?php

use App\Http\Controllers\Auth\OidcController;
use App\Http\Controllers\Auth\SimpleAuthController;
use App\Http\Controllers\CounterCommentController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\PatternController;
use App\Http\Controllers\PdfAnnotationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SyncTokenController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('projects.index');
    }

    return Inertia::render('Welcome');
});

// Conditional route registration
if (config('auth.mode') === 'simple') {
    Route::middleware('guest')->group(function () {
        Route::get('/register', [SimpleAuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [SimpleAuthController::class, 'register']);
        Route::get('/login', [SimpleAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [SimpleAuthController::class, 'login']);
    });

    // Disable Fortify routes
    Fortify::$registersRoutes = false;
} else {
    // Use default Fortify routes
    // (already registered via FortifyServiceProvider)

}

// Logout works for both modes
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect('/');
})->name('logout');

// OIDC Routes (available when OIDC is configured)
Route::middleware('web')->group(function () {
    Route::get('/auth/oidc/{provider}/redirect', [OidcController::class, 'redirect'])->name('oidc.redirect');
    Route::get('/auth/oidc/{provider}/callback', [OidcController::class, 'callback'])->name('oidc.callback');
});

Route::middleware('auth')->group(function () {
    Route::get('/auth/oidc/{provider}/link', [OidcController::class, 'link'])->name('oidc.link');
    Route::delete('/auth/oidc/{provider}/unlink', [OidcController::class, 'unlink'])->name('oidc.unlink');
});

// Conditional middleware based on auth mode
if (config('auth.mode') === 'simple') {
    $authMiddleware = ['auth'];
} else {
    $authMiddleware = ['auth', 'verified'];
}

// Legacy dashboard route - redirect to projects
Route::get('/dashboard', function () {
    return redirect()->route('projects.index');
})->middleware($authMiddleware)->name('dashboard');

Route::post('/sync/token', [SyncTokenController::class, 'store'])
    ->middleware($authMiddleware)
    ->name('sync.token');

// Project routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::get('/projects/{project}/pattern', [PatternController::class, 'show'])->name('projects.pattern');
    Route::get('/projects/{project}/thumbnail', [PatternController::class, 'thumbnail'])->name('projects.thumbnail');
    Route::get('/projects/{project}/pattern/cdn', [PatternController::class, 'cdnSignature'])->name('projects.pattern.cdn');

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

    // PDF Annotations
    Route::get('/projects/{project}/annotations', [PdfAnnotationController::class, 'index'])->name('annotations.index');
    Route::post('/projects/{project}/annotations', [PdfAnnotationController::class, 'store'])->name('annotations.store');
    Route::patch('/annotations/{annotationId}', [PdfAnnotationController::class, 'update'])->name('annotations.update');
    Route::delete('/annotations/{annotationId}', [PdfAnnotationController::class, 'destroy'])->name('annotations.destroy');

    // Stopwatch
    Route::patch('/projects/{project}/stopwatch/start', [\App\Http\Controllers\ProjectStopwatchController::class, 'start'])->name('projects.stopwatch.start');
    Route::patch('/projects/{project}/stopwatch/stop', [\App\Http\Controllers\ProjectStopwatchController::class, 'stop'])->name('projects.stopwatch.stop');
    Route::patch('/projects/{project}/stopwatch/reset', [\App\Http\Controllers\ProjectStopwatchController::class, 'reset'])->name('projects.stopwatch.reset');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/account', [ProfileController::class, 'account'])->name('account');

    // Add password update route for simple auth mode
    if (config('auth.mode') === 'simple') {
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    }
});

// CONDITIONALLY INCLUDE auth.php based on auth mode
if (config('auth.mode') === 'production') {
    require __DIR__.'/auth.php';
}
