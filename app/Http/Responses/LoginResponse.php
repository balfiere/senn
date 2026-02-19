<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request)
    {
        \Log::info('LoginResponse: toResponse called', [
            'auth_mode' => config('auth.mode'),
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
        ]);

        if (config('auth.mode') === 'production') {
            $user = Auth::user();
            \Log::info('LoginResponse: Production mode', [
                'user_exists' => ! is_null($user),
                'user_id' => $user?->id,
                'email_verified_at' => $user?->email_verified_at,
            ]);

            if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
                \Log::info('LoginResponse: User not verified, redirecting to verification.notice');

                return redirect()->route('verification.notice');
            }
        }

        \Log::info('LoginResponse: Redirecting to projects.index');

        return redirect()->intended(route('projects.index', absolute: false));
    }
}
