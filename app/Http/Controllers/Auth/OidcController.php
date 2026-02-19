<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Oidc\OidcService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class OidcController extends Controller
{
    public function __construct(
        protected OidcService $oidcService
    ) {}

    /**
     * Redirect to the OIDC provider.
     */
    public function redirect(Request $request, string $provider)
    {
        $providerConfig = $this->oidcService->getProvider($provider);

        if (! $providerConfig) {
            abort(404, 'OIDC provider not found.');
        }

        // Store the intended action in session (login or link)
        $request->session()->put('oidc_action', $request->query('action', 'login'));
        $request->session()->put('oidc_provider', $provider);

        // Configure the OIDC driver for this specific provider
        $this->configureOidcDriver($providerConfig);

        return Socialite::driver('oidc')->redirect();
    }

    /**
     * Handle the OIDC callback.
     */
    public function callback(Request $request, string $provider)
    {
        \Log::info('OIDC Callback initiated', ['provider' => $provider, 'action' => $request->session()->get('oidc_action', 'login')]);

        $action = $request->session()->get('oidc_action', 'login');

        // Verify session provider matches URL provider
        $sessionProvider = $request->session()->get('oidc_provider');
        if ($sessionProvider && $sessionProvider !== $provider) {
            \Log::warning('OIDC provider mismatch', ['session' => $sessionProvider, 'url' => $provider]);

            return redirect()->route('login')->withErrors(['oidc' => 'OIDC provider mismatch.']);
        }

        $providerConfig = $this->oidcService->getProvider($provider);

        if (! $providerConfig) {
            \Log::error('OIDC provider not found', ['provider' => $provider]);

            return redirect()->route('login')->withErrors(['oidc' => 'OIDC provider not found.']);
        }

        // Configure the OIDC driver for this specific provider
        $this->configureOidcDriver($providerConfig);

        try {
            $oidcUser = Socialite::driver('oidc')->user();
            \Log::info('OIDC user retrieved', [
                'id' => $oidcUser->getId(),
                'email' => $oidcUser->getEmail(),
                'name' => $oidcUser->getName(),
            ]);
        } catch (\Exception $e) {
            \Log::error('OIDC authentication failed', ['error' => $e->getMessage()]);

            return redirect()->route('login')->withErrors(['oidc' => 'OIDC authentication failed: '.$e->getMessage()]);
        }

        if ($action === 'link') {
            return $this->handleLink($request, $oidcUser, $provider);
        }

        return $this->handleLogin($oidcUser, $provider);
    }

    /**
     * Link an OIDC provider to the authenticated user's account.
     */
    public function link(Request $request, string $provider)
    {
        if (! Auth::check()) {
            abort(401, 'You must be logged in to link an account.');
        }

        $providerConfig = $this->oidcService->getProvider($provider);

        if (! $providerConfig) {
            abort(404, 'OIDC provider not found.');
        }

        // Store the intended action in session
        $request->session()->put('oidc_action', 'link');
        $request->session()->put('oidc_provider', $provider);

        // Configure the OIDC driver for this specific provider
        $this->configureOidcDriver($providerConfig);

        return Socialite::driver('oidc')->redirect();
    }

    /**
     * Unlink an OIDC provider from the authenticated user's account.
     */
    public function unlink(Request $request, string $provider)
    {
        /** @var User $user */
        $user = Auth::user();

        try {
            $this->oidcService->unlinkIdentity($user, $provider);

            return redirect()->route('account')
                ->with('status', "Successfully unlinked {$provider} from your account.");
        } catch (\Exception $e) {
            return redirect()->route('account')
                ->withErrors(['oidc' => $e->getMessage()]);
        }
    }

    /**
     * Handle login via OIDC.
     */
    protected function handleLogin($oidcUser, string $provider)
    {
        try {
            \Log::info('OIDC handleLogin: Starting', ['provider' => $provider]);

            $user = $this->oidcService->findOrCreateUser($oidcUser, $provider);
            \Log::info('OIDC handleLogin: User found/created', ['user_id' => $user->id, 'email' => $user->email]);

            $this->oidcService->login($user);
            \Log::info('OIDC handleLogin: Login called', ['auth_check' => Auth::check(), 'auth_id' => Auth::id()]);

            $redirectUrl = redirect()->intended(route('projects.index'))->getTargetUrl();
            \Log::info('OIDC handleLogin: Redirecting', ['url' => $redirectUrl]);

            return redirect()->intended(route('projects.index'));
        } catch (\Exception $e) {
            \Log::error('OIDC handleLogin: Exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->route('login')->withErrors(['oidc' => $e->getMessage()]);
        }
    }

    /**
     * Handle linking OIDC to existing account.
     */
    protected function handleLink(Request $request, $oidcUser, string $provider)
    {
        /** @var User $user */
        $user = Auth::user();

        try {
            $this->oidcService->linkIdentity($user, $oidcUser, $provider);

            return redirect()->route('account')
                ->with('status', "Successfully linked {$provider} to your account.");
        } catch (\Exception $e) {
            return redirect()->route('account')
                ->withErrors(['oidc' => $e->getMessage()]);
        }
    }

    /**
     * Configure the OIDC driver for a specific provider.
     *
     * @param  array{
     *     slug: string,
     *     base_url: string,
     *     client_id: string,
     *     client_secret: string,
     *     redirect: string|null,
     *     scopes: string,
     *     verify_jwt: bool
     * }  $config
     */
    protected function configureOidcDriver(array $config): void
    {
        // Generate redirect URL if not provided
        $redirect = $config['redirect'] ?? url("/auth/oidc/{$config['slug']}/callback");

        // Set the configuration for the OIDC driver dynamically
        config([
            'services.oidc' => [
                'base_url' => $config['base_url'],
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'redirect' => $redirect,
                'scopes' => $config['scopes'],
                'verify_jwt' => $config['verify_jwt'],
            ],
        ]);
    }
}
