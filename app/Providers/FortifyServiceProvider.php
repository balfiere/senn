<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Http\Responses\FailedPasswordResetLinkRequestResponse;
use App\Http\Responses\LoginResponse;
use App\Http\Responses\PasswordResetResponse;
use App\Http\Responses\RegisterResponse;
use App\Http\Responses\RequestPasswordResetLinkViewResponse;
use App\Http\Responses\ResetPasswordViewResponse;
use App\Http\Responses\SuccessfulPasswordResetLinkRequestResponse;
use App\Http\Responses\VerifyEmailResponse;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Fortify::ignoreRoutes();

        // Only register Fortify contracts in production mode
        if (config('auth.mode') !== 'simple') {
            $this->app->singleton(\Laravel\Fortify\Contracts\LoginResponse::class, LoginResponse::class);
            $this->app->singleton(\Laravel\Fortify\Contracts\LoginViewResponse::class, LoginResponse::class);
            $this->app->singleton(\Laravel\Fortify\Contracts\RegisterResponse::class, RegisterResponse::class);
            $this->app->singleton(\Laravel\Fortify\Contracts\RegisterViewResponse::class, RegisterResponse::class);
            $this->app->singleton(\Laravel\Fortify\Contracts\VerifyEmailResponse::class, VerifyEmailResponse::class);

            $this->app->singleton(
                \Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse::class,
                SuccessfulPasswordResetLinkRequestResponse::class
            );

            $this->app->singleton(
                \Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse::class,
                FailedPasswordResetLinkRequestResponse::class
            );

            $this->app->singleton(\Laravel\Fortify\Contracts\PasswordResetResponse::class, PasswordResetResponse::class);

            $this->app->singleton(
                \Laravel\Fortify\Contracts\RequestPasswordResetLinkViewResponse::class,
                RequestPasswordResetLinkViewResponse::class
            );

            $this->app->singleton(
                \Laravel\Fortify\Contracts\ResetPasswordViewResponse::class,
                ResetPasswordViewResponse::class
            );
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('auth.mode') === 'production') {
            Fortify::createUsersUsing(CreateNewUser::class);
            Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
            Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);

            Fortify::loginView(function () {
                return Inertia::render('Auth/Login', [
                    'canResetPassword' => Route::has('password.request'),
                    'status' => session('status'),
                ]);
            });

            Fortify::registerView(function () {
                return Inertia::render('Auth/Register');
            });

            Fortify::verifyEmailView(function () {
                return Inertia::render('Auth/VerifyEmail');
            });

            Fortify::requestPasswordResetLinkView(function () {
                return Inertia::render('Auth/ForgotPassword', [
                    'status' => session('status'),
                ]);
            });

            Fortify::resetPasswordView(function (Request $request) {
                return Inertia::render('Auth/ResetPassword', [
                    'email' => $request->email,
                    'token' => $request->route('token'),
                ]);
            });

            // Configure authentication to use email in production mode
            Fortify::authenticateUsing(function (Request $request) {
                $user = User::where('email', $request->email)->first();

                if ($user &&
                    Hash::check($request->password, $user->password)) {
                    return $user;
                }
            });

            RateLimiter::for('login', function (Request $request) {
                $email = (string) $request->input('email');

                return Limit::perMinute(5)->by($email.$request->ip());
            });

            RateLimiter::for('two-factor', function (Request $request) {
                return Limit::perMinute(5)->by($request->session()->get('login.id'));
            });
        }
    }
}
