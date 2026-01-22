import { Form, Head } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';

interface ResetPasswordProps {
    token: string;
    email?: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Reset Password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form
                        action={route('password.store')}
                        method="post"
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden fields */}
                                <input
                                    type="hidden"
                                    name="token"
                                    defaultValue={token}
                                />
                                <input
                                    type="hidden"
                                    name="email"
                                    defaultValue={email || ''}
                                />

                                {(errors.email || errors.token) && (
                                    <div className="bg-destructive/15 text-destructive mb-4 flex items-center gap-2 rounded-md p-3 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>
                                            {errors.email || errors.token}
                                        </span>
                                    </div>
                                )}

                                {/* Password Field */}
                                <FormField
                                    label="New Password"
                                    error={errors.password}
                                    required
                                >
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            placeholder="Enter your new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormField>

                                {/* Confirm Password Field */}
                                <FormField
                                    label="Confirm Password"
                                    error={errors.password_confirmation}
                                    required
                                >
                                    <div className="relative">
                                        <Input
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password_confirmation"
                                            placeholder="Confirm your new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormField>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Resetting Password...'
                                        : 'Reset Password'}
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="text-muted-foreground mt-4 text-center text-sm">
                        Remember your password?{' '}
                        <a
                            href={route('login')}
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                        >
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
