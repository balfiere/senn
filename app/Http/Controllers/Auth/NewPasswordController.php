<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        // ... existing code ...
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        \Illuminate\Support\Facades\Log::info('Password reset attempt', [
            'email' => $request->email,
            'status' => $status,
            'user_logged_in' => Auth::check(),
        ]);

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            // Log out the user if they were authenticated (for security after password change)
            if (Auth::check()) {
                Auth::logout();
            }

            return redirect()->route('password.reset.success')->with('status', __($status));
        }

        \Illuminate\Support\Facades\Log::error('Password reset failed', [
            'email' => $request->email,
            'status' => $status,
            'error_message' => trans($status),
        ]);

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    /**
     * Handle an incoming password reset request for authenticated users.
     */
    public function storeAuthenticated(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'token' => 'required',
            'email' => 'required|email|same:' . $user->email,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Verify the email matches the authenticated user
        if ($request->email !== $user->email) {
            return response()->json(['error' => 'Invalid email address'], 400);
        }

        // Attempt to reset the password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            // Log out the user after password reset for security
            Auth::logout();

            return response()->json(['message' => __($status)]);
        }

        return response()->json(['error' => trans($status)], 500);
    }
}