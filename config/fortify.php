<?php

use Laravel\Fortify\Features;

return [

    'guard' => 'web',

    'passwords' => 'users',

    'username' => config('auth.mode') === 'simple' ? 'username' : 'email',

    'email' => config('auth.mode') === 'simple' ? 'username' : 'email',

    'home' => '/projects',

    'prefix' => '',

    'domain' => null,

    'middleware' => ['web'],

    'limiters' => [
        'login' => 'login',
        'two-factor' => 'two-factor',
    ],

    'views' => config('auth.mode') === 'production',

    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        ...(config('auth.mode') !== 'simple' ? [Features::emailVerification()] : []),
        Features::updateProfileInformation(),
    ],

];
