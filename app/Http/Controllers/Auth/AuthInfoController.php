<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AuthInfoController extends Controller
{
    /**
     * Display the registration success page.
     */
    public function registerSuccess(): Response
    {
        return Inertia::render('Auth/RegisterSuccess');
    }

    /**
     * Display the authentication error page.
     */
    public function error(): Response
    {
        return Inertia::render('Auth/Error');
    }
}
