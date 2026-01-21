import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, KeyRound, LogOut, Mail, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { FormField } from '@/Components/ui/form-field';
import { FormGroup } from '@/Components/ui/form-group';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Form } from '@inertiajs/react';

function ChangeEmailSection() {
    const [expanded, setExpanded] = useState(false);
    const [email, setEmail] = useState('');

    return (
        <div className="border-b border-border">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/30 transition-colors px-1"
            >
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm uppercase tracking-wider">Change Email</span>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {expanded && (
                <div className="pb-6 px-1">
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your new email address. You'll need to verify it before the change takes effect.
                    </p>
                    <Form
                        action={route('profile.update')}
                        method="patch"
                        onSuccess={() => {
                            setExpanded(false);
                            setEmail('');
                        }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField label="New Email Address" error={errors.email} required>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing || !email}>
                                        {processing ? 'Updating...' : 'Update Email'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setEmail('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
}

function ChangePasswordSection() {
    const [expanded, setExpanded] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <div className="border-b border-border">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/30 transition-colors px-1"
            >
                <div className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm uppercase tracking-wider">Change Password</span>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {expanded && (
                <div className="pb-6 px-1">
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your current password and choose a new one.
                    </p>
                    <Form
                        action={route('password.update')}
                        method="put"
                        resetOnSuccess={['password', 'password_confirmation']}
                        onSuccess={() => {
                            setExpanded(false);
                            setFormData({ currentPassword: '', password: '', password_confirmation: '' });
                        }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField label="Current Password" error={errors.current_password} required>
                                    <Input
                                        type="password"
                                        name="current_password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        required
                                    />
                                </FormField>
                                <FormField label="New Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </FormField>
                                <FormField label="Confirm New Password" error={errors.password_confirmation} required>
                                    <Input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || !formData.currentPassword || !formData.password || !formData.password_confirmation}
                                    >
                                        {processing ? 'Changing...' : 'Change Password'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setFormData({ currentPassword: '', password: '', password_confirmation: '' });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
}

function ResetPasswordSection() {
    const [processing, setProcessing] = useState(false);

    const handleReset = () => {
        setProcessing(true);
        router.post(route('account.password.reset'), {}, {
            onSuccess: (page) => {
                setProcessing(false);
                // Check if there's a success message in the flash data
                const flash = page?.props?.flash as { success?: string; error?: string } | undefined;
                if (flash?.success) {
                    alert(flash.success);
                } else {
                    alert('Password reset email sent! Check your inbox.');
                }
            },
            onError: (errors) => {
                setProcessing(false);
                console.error('Password reset error:', errors);
                // Check if there's an error message in the response
                if (errors?.error) {
                    alert(errors.error);
                } else {
                    alert('Failed to send password reset email. Please try again.');
                }
            }
        });
    };

    return (
        <div className="border-b border-border">
            <button
                onClick={handleReset}
                disabled={processing}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-muted/30 transition-colors px-1 disabled:opacity-50"
            >
                <div className="flex items-center gap-3">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm uppercase tracking-wider">
                        {processing ? 'Sending...' : 'Reset Password via Email'}
                    </span>
                </div>
            </button>
        </div>
    );
}

function DeleteAccountSection() {
    const [expanded, setExpanded] = useState(false);
    const [confirmation, setConfirmation] = useState('');

    return (
        <div className="border-b border-destructive/30">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-destructive/5 transition-colors px-1"
            >
                <div className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="text-sm uppercase tracking-wider text-destructive">Delete Account</span>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-destructive" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-destructive" />
                )}
            </button>

            {expanded && (
                <div className="pb-6 px-1">
                    <p className="text-sm text-muted-foreground mb-4">
                        This action is permanent and cannot be undone. All your projects and data will be permanently deleted.
                    </p>
                    <Form
                        action={route('profile.destroy')}
                        method="delete"
                        onSuccess={() => router.visit('/')}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField label='Type "DELETE" to confirm' error={errors.password} required>
                                    <Input
                                        type="text"
                                        name="password"
                                        placeholder="DELETE"
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value)}
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing || confirmation !== 'DELETE'}
                                    >
                                        {processing ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setConfirmation('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface AccountPageProps extends PageProps {
    auth: {
        user: User;
    };
}

export default function Account(props: AccountPageProps) {
    const { user } = props.auth;
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="bg-background min-h-svh">
            <header className="bg-background/80 backdrop-blur-sm top-0 z-40 w-full sticky border-b border-border">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
                    <Link
                        href={route('projects.index')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm uppercase tracking-wider"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                    <h1 className="text-foreground text-sm uppercase tracking-[0.2em] font-medium">
                        Account
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
                        Account <span className="font-serif italic">settings</span>
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm tracking-wide">
                        Manage your account preferences and security
                    </p>
                </div>

                {/* Email & Password Section */}
                <FormGroup title="Email & Password" className="mb-12">
                    <div>
                        <ChangeEmailSection />
                        <ChangePasswordSection />
                        <ResetPasswordSection />
                    </div>
                </FormGroup>

                {/* Danger Zone */}
                <FormGroup title="Danger Zone" className="mb-12">
                    <div>
                        <DeleteAccountSection />
                    </div>
                </FormGroup>

                <Separator className="my-8" />

                {/* Sign Out */}
                <Button
                    variant="outline"
                    className="w-full justify-center rounded-none border-border bg-transparent hover:bg-foreground hover:text-background transition-all duration-300"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>

                <Separator className="my-8" />

                {/* About the App */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">
                        About the App
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Open-source pattern management for makers
                    </p>
                    <a
                        href="https://github.com/balfiere/rowcounter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 border border-border text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                        <span>View on GitHub</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </section>
            </main>
        </div>
    );
}