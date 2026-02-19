<?php

/**
 * OIDC Provider Configuration
 *
 * This configuration file parses OIDC providers from environment variables.
 * Providers are configured using numbered environment variables:
 *
 * OIDC_1_NAME=Keycloak
 * OIDC_1_SLUG=keycloak
 * OIDC_1_BASE_URL=https://auth.example.com/realms/myrealm
 * OIDC_1_CLIENT_ID=your-client-id
 * OIDC_1_CLIENT_SECRET=your-client-secret
 * OIDC_1_BUTTON_TEXT=Sign in with Keycloak
 * OIDC_1_SCOPES=openid email profile
 */
return [
    /*
    |--------------------------------------------------------------------------
    | OIDC Providers
    |--------------------------------------------------------------------------
    |
    | This array contains all configured OIDC providers, parsed from environment
    | variables. Each provider includes its configuration for OAuth2/OIDC flows.
    |
    */
    'providers' => (function () {
        $providers = [];
        $maxProviders = 10; // Support up to 10 OIDC providers

        for ($i = 1; $i <= $maxProviders; $i++) {
            $prefix = "OIDC_{$i}_";

            $name = env("{$prefix}NAME");
            $slug = env("{$prefix}SLUG");
            $baseUrl = env("{$prefix}BASE_URL");
            $clientId = env("{$prefix}CLIENT_ID");
            $clientSecret = env("{$prefix}CLIENT_SECRET");

            // Skip if required fields are not set
            if (! $name || ! $slug || ! $baseUrl || ! $clientId || ! $clientSecret) {
                continue;
            }

            $providers[$slug] = [
                'name' => $name,
                'slug' => $slug,
                'base_url' => $baseUrl,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect' => env("{$prefix}REDIRECT"),
                'scopes' => env("{$prefix}SCOPES", 'openid email profile'),
                'verify_jwt' => env("{$prefix}VERIFY_JWT", false),
            ];
        }

        return $providers;
    })(),

    /*
    |--------------------------------------------------------------------------
    | Are any OIDC providers configured?
    |--------------------------------------------------------------------------
    |
    | Quick check to determine if OIDC functionality should be enabled.
    |
    */
    'enabled' => (function () {
        $maxProviders = 10;

        for ($i = 1; $i <= $maxProviders; $i++) {
            $prefix = "OIDC_{$i}_";

            if (env("{$prefix}NAME") && env("{$prefix}SLUG") && env("{$prefix}BASE_URL")) {
                return true;
            }
        }

        return false;
    })(),
];
