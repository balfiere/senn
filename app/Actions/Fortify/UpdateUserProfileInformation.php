<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * Validate and update the given user's profile information.
     *
     * @param  array<string, mixed>  $input
     */
    public function update(User $user, array $input): User
    {
        if (config('auth.mode') === 'simple') {
            // Validate for username instead of email in simple mode
            Validator::make($input, [
                'name' => ['required', 'string', 'max:255'],
                'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique(User::class)->ignore($user->id)],
                'password' => ['required', 'current_password'],
            ])->validateWithBag('defaultProfileInformation');

            $oldUsername = $user->username;
            $newUsername = $input['username'];
            
            $user->forceFill([
                'name' => $input['name'],
                'username' => $newUsername,
            ])->save();
        } else {
            // Original email-based validation for production mode
            Validator::make($input, [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique(User::class)->ignore($user->id),
                ],
                'password' => ['required', 'current_password'],
            ])->validateWithBag('defaultProfileInformation');

            if ($input['email'] !== $user->email &&
                $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
                $this->updateVerifiedUser($user, $input);
            } else {
                $user->forceFill([
                    'name' => $input['name'],
                    'email' => $input['email'],
                ])->save();
            }
        }

        return $user;
    }

    /**
     * Update the given verified user's profile information.
     *
     * @param  array<string, mixed>  $input
     */
    protected function updateVerifiedUser(User $user, array $input): void
    {
        $user->forceFill([
            'name' => $input['name'],
            'email' => $input['email'],
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();
    }
}
