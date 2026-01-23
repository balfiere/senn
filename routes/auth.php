<?php

use App\Http\Controllers\Auth\AuthInfoController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationPromptController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController as FortifyPasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\Http\Controllers\VerifyEmailController;

// Guest routes (available only to unauthenticated users)
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('auth/error', [AuthInfoController::class, 'error'])
        ->name('auth.error');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [FortifyPasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [FortifyPasswordResetLinkController::class, 'store'])
        ->name('password.email');

});

Route::get('forgot-password/success', [AuthInfoController::class, 'forgotPasswordSuccess'])
    ->name('password.request.success');

Route::middleware('web')->group(function () {
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// Authenticated user routes
Route::middleware('auth')->group(function () {
    Route::get('register/success', [AuthInfoController::class, 'registerSuccess'])
        ->name('register.success');

    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // Route for authenticated users to request password reset
    Route::post('account/password-reset', [PasswordResetLinkController::class, 'sendAuthenticatedResetLink'])
        ->name('account.password.reset');

    // New route for authenticated users to submit password reset (this will handle the actual reset for authenticated users)
    Route::post('account/password-reset/submit', [NewPasswordController::class, 'storeAuthenticated'])
        ->name('account.password.reset.submit');
});

Route::get('password-reset-success', [AuthInfoController::class, 'passwordResetSuccess'])
    ->name('password.reset.success');
