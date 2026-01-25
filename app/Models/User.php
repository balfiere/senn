<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

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
        return !is_null($this->email_verified_at);
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
     * Get the identifier that will be used to represent the user.
     */
    public function getAuthIdentifierName(): string
    {
        if (config('auth.mode') === 'simple') {
            return 'username';
        }

        return 'email';
    }

    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifier()
    {
        return $this->{$this->getAuthIdentifierName()};
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * Get the token value for the "remember me" session.
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * Set the token value for the "remember me" session.
     */
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * Get the projects for the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
