import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import { AlertTriangle, ArrowLeft, ExternalLink, KeyRound, LogOut, Mail, RotateCcw, Trash2, User as UserIcon } from 'lucide-react';

import { SettingAction } from '@/Components/ui/setting-action';
import { SettingGroup } from '@/Components/ui/setting-group';
import { Button } from '@/Components/ui/button';
import { FormField } from '@/Components/ui/form-field';
import { FormGroup } from '@/Components/ui/form-group';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { Form } from '@inertiajs/react';

function ChangeEmailSection({ currentName }: { currentName: string }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <SettingGroup
            icon={<Mail />}
            title="Change Email"
            variant="default"
        >
            {({ setExpanded }) => (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your new email address and current password. You'll need to verify the new email before the change takes effect.
                    </p>
                    <Form
                        action={route('profile.update')}
                        method="patch"
                        errorBag="defaultProfileInformation"
                        onSuccess={() => {
                            setEmail('');
                            setPassword('');
                            setShowSuccess(true);
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                        }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="name" value={currentName} />
                                <FormField label="Current Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormField>
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
                                    <Button type="submit" disabled={processing || !email || !password}>
                                        {processing ? 'Updating...' : 'Update Email'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setEmail('');
                                            setPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                {showSuccess && (
                                    <div className="text-sm text-green-600 dark:text-green-400 mt-4">
                                        Email updated successfully! Please check your inbox to verify the new email address.
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </>
            )}
        </SettingGroup>
    );
}

function ChangePasswordSection() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        password: '',
        password_confirmation: '',
    });
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <SettingGroup
            icon={<KeyRound />}
            title="Change Password"
            variant="default"
        >
            {({ setExpanded }) => (
                <>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                        <AlertTriangle className="inline h-4 w-4 mr-2" />
                        Changing your password will log you out of all other devices.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your current password and choose a new one.
                    </p>
                    <Form
                        action={route('password.update')}
                        method="put"
                        resetOnSuccess={['password', 'password_confirmation']}
                        onSuccess={() => {
                            setFormData({ currentPassword: '', password: '', password_confirmation: '' });
                            setShowSuccess(true);
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                        }}
                        onError={(errors) => {
                            console.error('Password update error:', errors);
                            if (Object.keys(errors).length > 0) {
                                alert('Error updating password: ' + Object.values(errors)[0]);
                            }
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
                                {showSuccess && (
                                    <div className="text-sm text-green-600 dark:text-green-400 mt-4">
                                        Your password has been successfully updated!
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </>
            )}
        </SettingGroup>
    );
}

function ResetPasswordSection() {
    return (
        <SettingAction
            icon={<RotateCcw />}
            title="Reset Password via Email"
            variant="default"
            processingText="Sending..."
            action={async () => {
                await new Promise((resolve, reject) => {
                    router.post(route('account.password.reset'), {}, {
                        onSuccess: (page) => {
                            const flash = page?.props?.flash as { success?: string; error?: string } | undefined;
                            if (flash?.success) {
                                alert(flash.success);
                            } else {
                                alert('Password reset email sent! Check your inbox.');
                            }
                            resolve(void 0);
                        },
                        onError: (errors) => {
                            console.error('Password reset error:', errors);
                            if (errors?.error) {
                                alert(errors.error);
                            } else {
                                alert('Failed to send password reset email. Please try again.');
                            }
                            reject(errors);
                        }
                    });
                });
            }}
        />
    );
}

function ChangeUsernameSection({ currentName }: { currentName: string }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <SettingGroup
            icon={<UserIcon />}
            title="Change Username"
            variant="default"
        >
            {({ setExpanded }) => (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Enter your new username and current password to update your account.
                    </p>
                    <Form
                        action={route('profile.update')}
                        method="patch"
                        errorBag="defaultProfileInformation"
                        onSuccess={() => {
                            setUsername('');
                            setPassword('');
                            setShowSuccess(true);
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                        }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="name" value={currentName} />
                                <input type="hidden" name="email" value="" />
                                <FormField label="Current Password" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormField>
                                <FormField label="New Username" error={errors.username} required>
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="your_new_username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing || !username || !password}>
                                        {processing ? 'Updating...' : 'Update Username'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setUsername('');
                                            setPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                {showSuccess && (
                                    <div className="text-sm text-green-600 dark:text-green-400 mt-4">
                                        Username updated successfully!
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </>
            )}
        </SettingGroup>
    );
}

function DeleteAccountSection() {
    const [password, setPassword] = useState('');

    return (
        <SettingGroup
            icon={<Trash2 />}
            title="Delete Account"
            variant="destructive"
        >
            {({ setExpanded }) => (
                <>
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
                                <FormField label="Enter your password to confirm" error={errors.password} required>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing || !password}
                                    >
                                        {processing ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </>
            )}
        </SettingGroup>
    );
}

interface AccountPageProps extends PageProps {
    auth: {
        user: User & {
            username: string | null;
        };
    };
    authMode: 'simple' | 'production';
    status?: string;
}

export default function Account(props: AccountPageProps) {
    const { user } = props.auth;
    const { authMode } = props;
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
                        {user.email || user.username}
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
                        Account <span className="ml-1 font-serif italic tracking-wide">settings</span>
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm tracking-wide">
                        Manage your account preferences and security
                    </p>
                </div>

                {/* Account Settings Section */}
                <FormGroup title="Account Settings" className="mb-12">
                    <div>
                        {authMode === 'production' ? (
                            <ChangeEmailSection currentName={user.name} />
                        ) : (
                            <ChangeUsernameSection currentName={user.name} />
                        )}
                        <ChangePasswordSection />
                        {authMode === 'production' && <ResetPasswordSection />}
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
                    variant="default"
                    className="w-full justify-center"
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
