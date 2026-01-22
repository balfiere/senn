<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Always redirect to success page for security reasons (don't reveal if email exists)
        if ($status == Password::RESET_LINK_SENT) {
            return redirect()->route('password.request.success')->with('status', __($status));
        } else {
            // For invalid emails or other errors, still redirect to success but without status message
            return redirect()->route('password.request.success');
        }
    }

    /**
     * Handle an incoming password reset link request for authenticated users.
     */
    public function sendAuthenticatedResetLink(Request $request)
    {
        $user = $request->user();

        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('success', __($status));
        }

        return back()->with('error', trans($status));
    }
}
