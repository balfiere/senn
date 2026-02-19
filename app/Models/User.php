<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        $casts = [
            'password' => 'hashed',
        ];

        // Only include email_verified_at cast if not in simple mode
        if (config('auth.mode') !== 'simple') {
            $casts['email_verified_at'] = 'datetime';
        }

        return $casts;
    }

    /**
     * Determine if the user has verified their email address.
     */
    public function hasVerifiedEmail(): bool
    {
        if (config('auth.mode') === 'simple') {
            return true; // Always verified in simple mode
        }

        // In production mode, respect the actual email verification status
        return ! is_null($this->email_verified_at);
    }

    /**
     * Mark the given user's email as verified.
     */
    public function markEmailAsVerified(): bool
    {
        if (config('auth.mode') === 'simple') {
            return true; // No-op in simple mode
        }

        if (! $this->email_verified_at) {
            $this->forceFill([
                'email_verified_at' => $this->freshTimestamp(),
            ])->save();

            \Illuminate\Support\Facades\Event::dispatch(new \Illuminate\Auth\Events\Verified($this));
        }

        return true;
    }

    /**
     * Send the email verification notification.
     * Override from MustVerifyEmail contract.
     */
    public function sendEmailVerificationNotification(): void
    {
        // In simple mode, don't send verification emails
        if (config('auth.mode') === 'simple') {
            return;
        }

        // In production mode, send the notification
        $this->notify(new \Illuminate\Auth\Notifications\VerifyEmail);
    }

    /**
     * Get the email address that should be used for verification.
     */
    public function getEmailForVerification(): string
    {
        if (config('auth.mode') === 'simple') {
            return null; // No email for verification in simple mode
        }

        return $this->email;
    }

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * Get the identifier for the user.
     *
     * This override ensures we don't crash when transitioning from
     * email-based to ID-based sessions.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        $identifier = $this->{$this->getAuthIdentifierName()};

        // If we are in production and use IDs, but the session has an email (string),
        // we return null to force a logout instead of a SQL error.
        if (
            config('auth.mode') === 'production' &&
            $this->getAuthIdentifierName() === 'id' &&
            ! is_numeric($identifier) &&
            is_string($identifier)
        ) {
            return null;
        }

        return $identifier;
    }

    /**
     * Get the projects for the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get the OIDC identities for the user.
     */
    public function oidcIdentities(): HasMany
    {
        return $this->hasMany(OidcIdentity::class);
    }

    /**
     * Check if the user has a linked OIDC identity for a specific provider.
     */
    public function hasOidcIdentity(string $provider): bool
    {
        return $this->oidcIdentities()->where('provider', $provider)->exists();
    }

    /**
     * Get a linked OIDC identity for a specific provider.
     */
    public function getOidcIdentity(string $provider): ?OidcIdentity
    {
        return $this->oidcIdentities()->where('provider', $provider)->first();
    }

    /**
     * Check if the user has a password set.
     */
    public function hasPassword(): bool
    {
        return ! empty($this->password);
    }
}
