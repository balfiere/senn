<?php

use App\Models\OidcIdentity;
use App\Models\User;
use App\Services\Oidc\OidcService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Set up a test OIDC provider configuration
    Config::set('oidc.providers', [
        'test-provider' => [
            'name' => 'Test Provider',
            'slug' => 'test-provider',
            'base_url' => 'https://auth.test.com',
            'client_id' => 'test-client-id',
            'client_secret' => 'test-client-secret',
            'redirect' => 'http://localhost/auth/oidc/test-provider/callback',
            'button_text' => 'Sign in with Test Provider',
            'scopes' => 'openid email profile',
            'verify_jwt' => false,
        ],
        'test-provider-2' => [
            'name' => 'Test Provider 2',
            'slug' => 'test-provider-2',
            'base_url' => 'https://auth2.test.com',
            'client_id' => 'test-client-id-2',
            'client_secret' => 'test-client-secret-2',
            'redirect' => 'http://localhost/auth/oidc/test-provider-2/callback',
            'button_text' => 'Sign in with Provider 2',
            'scopes' => 'openid email profile',
            'verify_jwt' => false,
        ],
    ]);
    Config::set('oidc.enabled', true);
});

// ============================================
// UNIT TESTS: OidcService
// ============================================

it('can get configured providers', function () {
    $providers = app(OidcService::class)->getProviders();

    expect($providers)->toHaveCount(2)
        ->and($providers['test-provider']['name'])->toBe('Test Provider')
        ->and($providers['test-provider']['slug'])->toBe('test-provider')
        ->and($providers['test-provider-2']['name'])->toBe('Test Provider 2');
});

it('returns empty array when OIDC is disabled', function () {
    Config::set('oidc.enabled', false);

    $providers = app(OidcService::class)->getProviders();

    expect($providers)->toHaveCount(0);
});

it('can find a provider by slug', function () {
    $provider = app(OidcService::class)->findProvider('test-provider');

    expect($provider)->not->toBeNull()
        ->and($provider['name'])->toBe('Test Provider');
});

it('returns null for non-existent provider', function () {
    $provider = app(OidcService::class)->findProvider('non-existent');

    expect($provider)->toBeNull();
});

it('can check if user has password', function () {
    $userWithPassword = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    // Create user without password using DB to bypass model casting
    $userId = DB::table('users')->insertGetId([
        'name' => 'No Password User',
        'username' => 'nopass_user',
        'email' => 'nopass@example.com',
        'password' => '',
        'email_verified_at' => now(),
        'remember_token' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $userWithoutPassword = User::find($userId);

    expect($userWithPassword->hasPassword())->toBeTrue()
        ->and($userWithoutPassword->hasPassword())->toBeFalse();
});

// ============================================
// INTEGRATION TESTS: OIDC Identity Management
// ============================================

it('can link OIDC identity to user', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $identity = $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'oidc-123',
        'email' => 'test@example.com',
    ]);

    expect($identity)->not->toBeNull()
        ->and($identity->provider)->toBe('test-provider')
        ->and($identity->provider_id)->toBe('oidc-123')
        ->and($user->oidcIdentities()->count())->toBe(1);
});

it('can find user by OIDC identity', function () {
    $user = User::factory()->create([
        'email' => 'linked@example.com',
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'oidc-456',
        'email' => 'linked@example.com',
    ]);

    $foundIdentity = OidcIdentity::where('provider', 'test-provider')
        ->where('provider_id', 'oidc-456')
        ->first();

    expect($foundIdentity)->not->toBeNull()
        ->and($foundIdentity->user->id)->toBe($user->id);
});

it('enforces unique provider_id per provider', function () {
    $user1 = User::factory()->create([
        'email' => 'user1@example.com',
        'password' => bcrypt('password'),
    ]);

    $user1->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'unique-oidc-id',
        'email' => 'user1@example.com',
    ]);

    $user2 = User::factory()->create([
        'email' => 'user2@example.com',
        'password' => bcrypt('password'),
    ]);

    expect(fn () => $user2->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'unique-oidc-id',
        'email' => 'user2@example.com',
    ]))->toThrow(\Illuminate\Database\QueryException::class);
});

it('allows same user to have multiple providers', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'oidc-1',
        'email' => 'test@example.com',
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider-2',
        'provider_id' => 'oidc-2',
        'email' => 'test@example.com',
    ]);

    expect($user->oidcIdentities()->count())->toBe(2);
});

it('allows same provider_id for different providers', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    // Same provider_id but different providers should be allowed
    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'same-id',
        'email' => 'test@example.com',
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider-2',
        'provider_id' => 'same-id',
        'email' => 'test@example.com',
    ]);

    expect($user->oidcIdentities()->count())->toBe(2);
});

// ============================================
// ROUTE TESTS
// ============================================

it('returns 404 for non-existent provider on redirect', function () {
    $response = $this->get(route('oidc.redirect', ['provider' => 'non-existent']));

    $response->assertStatus(404);
});

it('requires authentication to link OIDC provider', function () {
    $response = $this->get(route('oidc.link', ['provider' => 'test-provider']));

    // Should redirect to login or return 401
    $response->assertRedirect(route('login'));
});

it('unlinks OIDC provider from authenticated user with password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);
    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'oidc-id-to-unlink',
        'email' => 'test@example.com',
    ]);

    $this->actingAs($user);

    $response = $this->delete(route('oidc.unlink', ['provider' => 'test-provider']));

    $response->assertRedirect(route('account'));
    expect(OidcIdentity::where('user_id', $user->id)->count())->toBe(0);
});

it('prevents unlinking when user has no password', function () {
    // Create user without password using DB to bypass model casting
    $userId = DB::table('users')->insertGetId([
        'name' => 'No Password User',
        'username' => 'nopass_user_oidc',
        'email' => 'nopass-oidc@example.com',
        'password' => '',
        'email_verified_at' => now(),
        'remember_token' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $user = User::find($userId);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'only-oidc-id',
        'email' => 'nopass-oidc@example.com',
    ]);

    $this->actingAs($user);

    $response = $this->delete(route('oidc.unlink', ['provider' => 'test-provider']));

    $response->assertRedirect(route('account'));
    expect(OidcIdentity::where('user_id', $user->id)->count())->toBe(1);
});

it('allows unlinking when user has password and another OIDC provider', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'oidc-1',
        'email' => 'test@example.com',
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider-2',
        'provider_id' => 'oidc-2',
        'email' => 'test@example.com',
    ]);

    $this->actingAs($user);

    $response = $this->delete(route('oidc.unlink', ['provider' => 'test-provider']));

    $response->assertRedirect(route('account'));
    expect(OidcIdentity::where('user_id', $user->id)->count())->toBe(1);
    expect($user->hasOidcIdentity('test-provider'))->toBeFalse();
    expect($user->hasOidcIdentity('test-provider-2'))->toBeTrue();
});

// ============================================
// OIDC SERVICE: findOrCreateUser
// ============================================

it('creates new user from OIDC data', function () {
    $service = app(OidcService::class);

    // Mock Socialite user
    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'new-oidc-id';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'New User';
        }

        public function getEmail()
        {
            return 'newuser@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    $user = $service->findOrCreateUser($socialiteUser, 'test-provider');

    expect($user)->not->toBeNull()
        ->and($user->email)->toBe('newuser@example.com')
        ->and($user->name)->toBe('New User')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->hasPassword())->toBeFalse();

    // Check OIDC identity was created
    $identity = OidcIdentity::where('user_id', $user->id)->first();
    expect($identity)->not->toBeNull()
        ->and($identity->provider)->toBe('test-provider')
        ->and($identity->provider_id)->toBe('new-oidc-id');
});

it('links existing user by email from OIDC data', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'password' => bcrypt('password'),
    ]);

    $service = app(OidcService::class);

    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'oidc-for-existing';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'Some Name';
        }

        public function getEmail()
        {
            return 'existing@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    $user = $service->findOrCreateUser($socialiteUser, 'test-provider');

    // Should return existing user, not create new one
    expect($user->id)->toBe($existingUser->id)
        ->and(User::where('email', 'existing@example.com')->count())->toBe(1);

    // Check OIDC identity was linked
    $identity = OidcIdentity::where('user_id', $user->id)->first();
    expect($identity)->not->toBeNull()
        ->and($identity->provider_id)->toBe('oidc-for-existing');
});

it('returns existing user with existing OIDC identity', function () {
    $user = User::factory()->create([
        'email' => 'already-linked@example.com',
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'existing-identity-id',
        'email' => 'already-linked@example.com',
    ]);

    $service = app(OidcService::class);

    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'existing-identity-id';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'Already Linked';
        }

        public function getEmail()
        {
            return 'already-linked@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    $returnedUser = $service->findOrCreateUser($socialiteUser, 'test-provider');

    expect($returnedUser->id)->toBe($user->id);

    // Should not create duplicate identities
    expect(OidcIdentity::where('user_id', $user->id)->count())->toBe(1);
});

// ============================================
// OIDC SERVICE: linkIdentity
// ============================================

it('links identity to authenticated user', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $service = app(OidcService::class);

    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'link-oidc-id';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'Link Test';
        }

        public function getEmail()
        {
            return 'link@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    $identity = $service->linkIdentity($user, $socialiteUser, 'test-provider');

    expect($identity)->not->toBeNull()
        ->and($identity->provider)->toBe('test-provider')
        ->and($identity->provider_id)->toBe('link-oidc-id')
        ->and($identity->user_id)->toBe($user->id);
});

it('throws error when linking identity already linked to another user', function () {
    $user1 = User::factory()->create([
        'email' => 'user1@example.com',
        'password' => bcrypt('password'),
    ]);

    $user1->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'already-owned-id',
        'email' => 'user1@example.com',
    ]);

    $user2 = User::factory()->create([
        'email' => 'user2@example.com',
        'password' => bcrypt('password'),
    ]);

    $service = app(OidcService::class);

    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'already-owned-id';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'User 1';
        }

        public function getEmail()
        {
            return 'user1@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    expect(fn () => $service->linkIdentity($user2, $socialiteUser, 'test-provider'))
        ->toThrow(\Exception::class, 'This OIDC identity is already linked to another user.');
});

it('throws error when user already has this provider linked', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'existing-link',
        'email' => 'test@example.com',
    ]);

    $service = app(OidcService::class);

    $socialiteUser = new class implements \Laravel\Socialite\Contracts\User
    {
        public function getId()
        {
            return 'different-oidc-id';
        }

        public function getNickname()
        {
            return null;
        }

        public function getName()
        {
            return 'Test';
        }

        public function getEmail()
        {
            return 'test@example.com';
        }

        public function getAvatar()
        {
            return null;
        }
    };

    expect(fn () => $service->linkIdentity($user, $socialiteUser, 'test-provider'))
        ->toThrow(\Exception::class, 'You already have this provider linked to your account.');
});

// ============================================
// OIDC SERVICE: unlinkIdentity
// ============================================

it('unlinks identity successfully when user has password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'unlink-id',
        'email' => 'test@example.com',
    ]);

    $service = app(OidcService::class);

    $service->unlinkIdentity($user, 'test-provider');

    expect($user->oidcIdentities()->count())->toBe(0);
});

it('throws error when unlinking only auth method', function () {
    $userId = DB::table('users')->insertGetId([
        'name' => 'OIDC Only User',
        'username' => 'oidc_only_user',
        'email' => 'oidc-only@example.com',
        'password' => '',
        'email_verified_at' => now(),
        'remember_token' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $user = User::find($userId);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'only-auth-id',
        'email' => 'oidc-only@example.com',
    ]);

    $service = app(OidcService::class);

    expect(fn () => $service->unlinkIdentity($user, 'test-provider'))
        ->toThrow(\Exception::class, 'Cannot unlink your only authentication method. Please set a password first.');
});

it('throws error when provider is not linked', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $service = app(OidcService::class);

    expect(fn () => $service->unlinkIdentity($user, 'test-provider'))
        ->toThrow(\Exception::class, 'This provider is not linked to your account.');
});

// ============================================
// CASCADE DELETE TESTS
// ============================================

it('deletes OIDC identities when user is deleted', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'cascade-delete-id',
        'email' => 'cascade@example.com',
    ]);

    $userId = $user->id;
    $user->delete();

    expect(User::find($userId))->toBeNull()
        ->and(OidcIdentity::where('user_id', $userId)->count())->toBe(0);
});

// ============================================
// ACCOUNT PAGE DATA TESTS
// ============================================

it('shows linked providers on account page', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $user->oidcIdentities()->create([
        'provider' => 'test-provider',
        'provider_id' => 'shown-id',
        'email' => 'shown@example.com',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('account'));

    $response->assertInertia(fn ($page) => $page
        ->where('oidc.enabled', true)
        ->where('oidc.providers.0.slug', 'test-provider')
        ->where('oidc.providers.0.linked', true)
        ->where('oidc.providers.0.email', 'shown@example.com')
        ->where('oidc.providers.1.slug', 'test-provider-2')
        ->where('oidc.providers.1.linked', false)
    );
});

it('shows has_password correctly on account page', function () {
    $userWithPassword = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $userId = DB::table('users')->insertGetId([
        'name' => 'No Password',
        'username' => 'nopass',
        'email' => 'nopass2@example.com',
        'password' => '',
        'email_verified_at' => now(),
        'remember_token' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $userWithoutPassword = User::find($userId);

    // User with password
    $response = $this->actingAs($userWithPassword)->get(route('account'));
    $response->assertInertia(fn ($page) => $page
        ->where('auth.user.has_password', true)
    );

    // User without password
    $response = $this->actingAs($userWithoutPassword)->get(route('account'));
    $response->assertInertia(fn ($page) => $page
        ->where('auth.user.has_password', false)
    );
});
