<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\PasswordResetResponse as PasswordResetResponseContract;

class PasswordResetResponse implements PasswordResetResponseContract, Responsable
{
    /**
     * The password reset status.
     */
    public string $status;

    public function __construct(string $status)
    {
        $this->status = $status;
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request)
    {
        if (Auth::check()) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('password.reset.success')->with('status', __($this->status));
    }
}
