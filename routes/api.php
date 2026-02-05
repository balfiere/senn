<?php

use App\Http\Controllers\Sync\SyncPullController;
use App\Http\Controllers\Sync\SyncPushController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sync/push', SyncPushController::class)->name('api.sync.push');
    Route::get('/sync/pull', SyncPullController::class)->name('api.sync.pull');
});
