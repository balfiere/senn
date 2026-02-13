<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request)
    {
        if (config('auth.mode') === 'simple') {
            return redirect()->intended(route('projects.index', absolute: false));
        }

        // For production mode - redirect to register success page
        // Fortify will handle email verification automatically
        return redirect()->route('register.success');
    }
}
