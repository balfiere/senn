<?php

namespace App\Services\Oidc;

use App\Models\OidcIdentity;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\OIDC\Provider as OidcProvider;

class OidcService
{
    /**
     * Get all configured OIDC providers.
     *
     * @return array<string, array{
     *     name: string,
     *     slug: string,
     *     base_url: string,
     *     client_id: string,
     *     client_secret: string,
     *     redirect: string,
     *     button_text: string,
     *     scopes: string,
     *     verify_jwt: bool
     * }>
     */
    public function getProviders(): array
    {
        if (! $this->isEnabled()) {
            return [];
        }

        return config('oidc.providers', []);
    }

    /**
     * Find a provider by slug.
     *
     * @return array{
     *     name: string,
     *     slug: string,
     *     base_url: string,
     *     client_id: string,
     *     client_secret: string,
     *     redirect: string,
     *     button_text: string,
     *     scopes: string,
     *     verify_jwt: bool
     * }|null
     */
    public function findProvider(string $slug): ?array
    {
        return $this->getProviders()[$slug] ?? null;
    }

    /**
     * Check if any OIDC providers are configured.
     */
    public function isEnabled(): bool
    {
        return config('oidc.enabled', false);
    }

    /**
     * Get a specific provider configuration by slug.
     *
     * @return array{
     *     name: string,
     *     slug: string,
     *     base_url: string,
     *     client_id: string,
     *     client_secret: string,
     *     redirect: string,
     *     button_text: string,
     *     scopes: string,
     *     verify_jwt: bool
     * }|null
     */
    public function getProvider(string $slug): ?array
    {
        return $this->getProviders()[$slug] ?? null;
    }

    /**
     * Get the Socialite driver for a provider.
     *
     * @param  array{
     *     slug: string,
     *     base_url: string,
     *     client_id: string,
     *     client_secret: string,
     *     redirect: string,
     *     scopes: string,
     *     verify_jwt: bool
     * }  $providerConfig
     */
    public function getDriver(array $providerConfig): OidcProvider
    {
        /** @var OidcProvider $driver */
        $driver = Socialite::driver('oidc');

        // Set the configuration for this specific provider
        $driver->setConfig(
            $providerConfig['base_url'],
            $providerConfig['client_id'],
            $providerConfig['client_secret'],
            $providerConfig['redirect']
        );

        // Set scopes
        if (! empty($providerConfig['scopes'])) {
            $driver->scopes(explode(' ', $providerConfig['scopes']));
        }

        return $driver;
    }

    /**
     * Find or create a user from OIDC authentication.
     *
     * @param  SocialiteUser  $oidcUser  The user from the OIDC provider
     * @param  string  $providerSlug  The provider identifier
     * @return User The authenticated user
     */
    public function findOrCreateUser(SocialiteUser $oidcUser, string $providerSlug): User
    {
        \Log::info('OidcService findOrCreateUser: Starting', ['provider' => $providerSlug]);

        return DB::transaction(function () use ($oidcUser, $providerSlug) {
            $providerId = $oidcUser->getId();
            $email = $oidcUser->getEmail();
            $name = $oidcUser->getName() ?? $oidcUser->getNickname() ?? 'Unknown';

            \Log::info('OidcService findOrCreateUser: OIDC user data', [
                'provider_id' => $providerId,
                'email' => $email,
                'name' => $name,
            ]);

            // 1. Check if OIDC identity already exists (by provider + provider_id)
            $existingIdentity = OidcIdentity::findByProvider($providerSlug, $providerId);
            if ($existingIdentity) {
                \Log::info('OidcService findOrCreateUser: Found existing identity', ['user_id' => $existingIdentity->user_id]);

                // Update email if changed
                if ($email && $existingIdentity->email !== $email) {
                    $existingIdentity->update(['email' => $email]);
                }

                return $existingIdentity->user;
            }

            // 2. Check if user exists with same email (auto-link)
            if ($email) {
                $existingUser = User::where('email', $email)->first();
                if ($existingUser) {
                    \Log::info('OidcService findOrCreateUser: Found existing user by email, linking', ['user_id' => $existingUser->id]);

                    // Create OIDC identity for existing user
                    $existingUser->oidcIdentities()->create([
                        'provider' => $providerSlug,
                        'provider_id' => $providerId,
                        'email' => $email,
                    ]);

                    return $existingUser;
                }
            }

            // 3. Create new user with OIDC identity
            \Log::info('OidcService findOrCreateUser: Creating new user');

            $username = $this->generateUniqueUsername($email, $name);
            \Log::info('OidcService findOrCreateUser: Generated username', ['username' => $username]);

            $user = User::create([
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'password' => null, // No password for OIDC-only users
                'email_verified_at' => now(), // OIDC users are auto-verified
            ]);

            \Log::info('OidcService findOrCreateUser: User created', ['user_id' => $user->id]);

            $user->oidcIdentities()->create([
                'provider' => $providerSlug,
                'provider_id' => $providerId,
                'email' => $email,
            ]);

            \Log::info('OidcService findOrCreateUser: OIDC identity created');

            return $user;
        });
    }

    /**
     * Link an OIDC identity to an existing user.
     *
     * @param  User  $user  The user to link to
     * @param  SocialiteUser  $oidcUser  The user from the OIDC provider
     * @param  string  $providerSlug  The provider identifier
     * @return OidcIdentity The created identity
     *
     * @throws \Exception If identity already linked to another user
     */
    public function linkIdentity(User $user, SocialiteUser $oidcUser, string $providerSlug): OidcIdentity
    {
        $providerId = $oidcUser->getId();
        $email = $oidcUser->getEmail();

        // Check if this identity is already linked to another user
        $existingIdentity = OidcIdentity::findByProvider($providerSlug, $providerId);
        if ($existingIdentity && $existingIdentity->user_id !== $user->id) {
            throw new \Exception('This OIDC identity is already linked to another user.');
        }

        // Check if user already has this provider linked
        if ($user->hasOidcIdentity($providerSlug)) {
            throw new \Exception('You already have this provider linked to your account.');
        }

        return $user->oidcIdentities()->create([
            'provider' => $providerSlug,
            'provider_id' => $providerId,
            'email' => $email,
        ]);
    }

    /**
     * Unlink an OIDC identity from a user.
     *
     * @param  User  $user  The user to unlink from
     * @param  string  $providerSlug  The provider identifier
     *
     * @throws \Exception If user has no password and this is their only auth method
     */
    public function unlinkIdentity(User $user, string $providerSlug): void
    {
        $identity = $user->getOidcIdentity($providerSlug);

        if (! $identity) {
            throw new \Exception('This provider is not linked to your account.');
        }

        // Safety check: ensure user has another way to authenticate
        if (! $user->hasPassword() && $user->oidcIdentities()->count() === 1) {
            throw new \Exception('Cannot unlink your only authentication method. Please set a password first.');
        }

        $identity->delete();
    }

    /**
     * Log in a user.
     */
    public function login(User $user): void
    {
        Auth::login($user, true);
    }

    /**
     * Generate a unique username from email or name.
     */
    protected function generateUniqueUsername(?string $email, string $name): string
    {
        // Try email local part first
        if ($email) {
            $base = strstr($email, '@', true);
            $base = preg_replace('/[^a-zA-Z0-9_]/', '', $base);
            if ($base && $this->isUsernameAvailable($base)) {
                return $base;
            }
        }

        // Fall back to name-based username
        $base = preg_replace('/[^a-zA-Z0-9_]/', '', strtolower(str_replace(' ', '_', $name)));
        $base = substr($base, 0, 20);

        if ($this->isUsernameAvailable($base)) {
            return $base;
        }

        // Append random suffix
        $suffix = 1;
        while (! $this->isUsernameAvailable("{$base}_{$suffix}")) {
            $suffix++;
        }

        return "{$base}_{$suffix}";
    }

    /**
     * Check if a username is available.
     */
    protected function isUsernameAvailable(string $username): bool
    {
        return User::where('username', $username)->doesntExist();
    }
}
