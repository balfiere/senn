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
        if (config('auth.mode') === 'production') {
            $user = Auth::user();
            if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
                return redirect()->route('verification.notice');
            }
        }

        return redirect()->intended(route('projects.index', absolute: false));
    }
}
