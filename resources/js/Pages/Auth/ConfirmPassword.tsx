import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FormField } from '@/Components/ui/form-field';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Form, Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <Card className="border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground">Confirm Password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Please confirm your password before continuing.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form action="/confirm-password" method="post" className="flex flex-col gap-4">
                        {({ processing, errors }) => (
                            <>
                                <FormField label="Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                </FormField>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Confirming...' : 'Confirm'}
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
