<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $provider
 * @property string $provider_id
 * @property string|null $email
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 */
class OidcIdentity extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'email',
    ];

    /**
     * Get the user that owns this OIDC identity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Find an identity by provider and provider ID.
     */
    public static function findByProvider(string $provider, string $providerId): ?self
    {
        return self::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();
    }

    /**
     * Find an identity by provider and email.
     */
    public static function findByProviderAndEmail(string $provider, string $email): ?self
    {
        return self::where('provider', $provider)
            ->where('email', $email)
            ->first();
    }
}
