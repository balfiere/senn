<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Support\Responsable;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse as FailedPasswordResetLinkRequestResponseContract;

class FailedPasswordResetLinkRequestResponse implements FailedPasswordResetLinkRequestResponseContract, Responsable
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
        return redirect()->route('password.request.success');
    }
}
