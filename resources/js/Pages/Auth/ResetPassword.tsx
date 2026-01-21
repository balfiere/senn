import { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface ResetPasswordProps {
    token: string;
    email?: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-svh flex items-center justify-center bg-muted/30 p-4">
            <Head title="Reset Password" />

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
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
                                <input type="hidden" name="token" defaultValue={token} />
                                <input type="hidden" name="email" defaultValue={email || ''} />

                                {(errors.email || errors.token) && (
                                    <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive flex items-center gap-2 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{errors.email || errors.token}</span>
                                    </div>
                                )}

                                {/* Password Field */}
                                <FormField label="New Password" error={errors.password} required>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter your new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
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
                                <FormField label="Confirm Password" error={errors.password_confirmation} required>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            placeholder="Confirm your new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    {processing ? 'Resetting Password...' : 'Reset Password'}
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <a
                            href={route('login')}
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}