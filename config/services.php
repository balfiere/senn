<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Public OAuth providers
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL').'/auth/google/callback'),
        'enabled' => env('GOOGLE_AUTH_ENABLED', false),
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_REDIRECT_URI', env('APP_URL').'/auth/github/callback'),
        'enabled' => env('GITHUB_AUTH_ENABLED', false),
    ],

    // Generic OIDC provider (for Authentik, Authelia, Keycloak, etc.)
    'oidc' => [
        'client_id' => env('OIDC_CLIENT_ID'),
        'client_secret' => env('OIDC_CLIENT_SECRET'),
        'redirect' => env('OIDC_REDIRECT_URI', env('APP_URL').'/auth/oidc/callback'),
        'base_url' => env('OIDC_BASE_URL'), // e.g., https://auth.yourdomain.com
        'authorize_url' => env('OIDC_AUTHORIZE_URL'), // optional, for custom endpoints
        'token_url' => env('OIDC_TOKEN_URL'), // optional
        'userinfo_url' => env('OIDC_USERINFO_URL'), // optional
        'enabled' => env('OIDC_ENABLED', false),
        'name' => env('OIDC_PROVIDER_NAME', 'SSO'), // Display name for the button
    ],

];
