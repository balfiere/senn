import { Form, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Check,
    ExternalLink,
    KeyRound,
    Link as LinkIcon,
    LogOut,
    Mail,
    Plus,
    RotateCcw,
    Trash2,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import { FormField } from '@/Components/ui/form-field';
import { FormGroup } from '@/Components/ui/form-group';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { SettingAction } from '@/Components/ui/setting-action';
import { SettingGroup } from '@/Components/ui/setting-group';
import { PageProps, User } from '@/types';

function ChangeEmailSection({ currentName }: { currentName: string }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <SettingGroup icon={<Mail />} title="Change Email" variant="default">
            {({ setExpanded }) => (
                <>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Enter your new email address and current password.
                        You'll need to verify the new email before the change
                        takes effect.
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
                                <input
                                    type="hidden"
                                    name="name"
                                    value={currentName}
                                />
                                <FormField
                                    label="Current Password"
                                    error={errors.password}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your current password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="New Email Address"
                                    error={errors.email}
                                    required
                                >
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || !email || !password
                                        }
                                    >
                                        {processing
                                            ? 'Updating...'
                                            : 'Update Email'}
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
                                    <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                                        Email updated successfully! Please check
                                        your inbox to verify the new email
                                        address.
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

function ChangePasswordSection({ hasPassword }: { hasPassword: boolean }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        password: '',
        password_confirmation: '',
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const isFormValid = hasPassword
        ? formData.currentPassword &&
          formData.password &&
          formData.password_confirmation
        : formData.password && formData.password_confirmation;

    return (
        <SettingGroup
            icon={<KeyRound />}
            title={hasPassword ? 'Change Password' : 'Set Password'}
            variant="default"
        >
            {({ setExpanded }) => (
                <>
                    {hasPassword ? (
                        <>
                            <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="mr-2 inline h-4 w-4" />
                                Changing your password will log you out of all
                                other devices.
                            </p>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Enter your current password and choose a new
                                one.
                            </p>
                        </>
                    ) : (
                        <p className="text-muted-foreground mb-4 text-sm">
                            You signed up with an external provider. Set a
                            password to enable password-based login.
                        </p>
                    )}
                    <Form
                        action={route('password.update')}
                        method="put"
                        resetOnSuccess={['password', 'password_confirmation']}
                        onSuccess={() => {
                            setFormData({
                                currentPassword: '',
                                password: '',
                                password_confirmation: '',
                            });
                            setShowSuccess(true);
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                        }}
                        onError={(errors) => {
                            console.error('Password update error:', errors);
                            if (Object.keys(errors).length > 0) {
                                alert(
                                    'Error updating password: ' +
                                        Object.values(errors)[0],
                                );
                            }
                        }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {hasPassword && (
                                    <FormField
                                        label="Current Password"
                                        error={errors.current_password}
                                        required
                                    >
                                        <Input
                                            type="password"
                                            name="current_password"
                                            value={formData.currentPassword}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    currentPassword:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </FormField>
                                )}
                                <FormField
                                    label={
                                        hasPassword
                                            ? 'New Password'
                                            : 'Password'
                                    }
                                    error={errors.password}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="Confirm Password"
                                    error={errors.password_confirmation}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password_confirmation:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || !isFormValid}
                                    >
                                        {processing
                                            ? hasPassword
                                                ? 'Changing...'
                                                : 'Setting...'
                                            : hasPassword
                                              ? 'Change Password'
                                              : 'Set Password'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setFormData({
                                                currentPassword: '',
                                                password: '',
                                                password_confirmation: '',
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                {showSuccess && (
                                    <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                                        Your password has been successfully{' '}
                                        {hasPassword ? 'updated' : 'set'}!
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
                    router.post(
                        route('account.password.reset'),
                        {},
                        {
                            onSuccess: (page) => {
                                const flash = page?.props?.flash as
                                    | { success?: string; error?: string }
                                    | undefined;
                                if (flash?.success) {
                                    alert(flash.success);
                                } else {
                                    alert(
                                        'Password reset email sent! Check your inbox.',
                                    );
                                }
                                resolve(void 0);
                            },
                            onError: (errors) => {
                                console.error('Password reset error:', errors);
                                if (errors?.error) {
                                    alert(errors.error);
                                } else {
                                    alert(
                                        'Failed to send password reset email. Please try again.',
                                    );
                                }
                                reject(errors);
                            },
                        },
                    );
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
                    <p className="text-muted-foreground mb-4 text-sm">
                        Enter your new username and current password to update
                        your account.
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
                                <input
                                    type="hidden"
                                    name="name"
                                    value={currentName}
                                />
                                <input type="hidden" name="email" value="" />
                                <FormField
                                    label="Current Password"
                                    error={errors.password}
                                    required
                                >
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your current password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="New Username"
                                    error={errors.username}
                                    required
                                >
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="your_new_username"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        required
                                    />
                                </FormField>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || !username || !password
                                        }
                                    >
                                        {processing
                                            ? 'Updating...'
                                            : 'Update Username'}
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
                                    <div className="mt-4 text-sm text-green-600 dark:text-green-400">
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

function DeleteAccountSection({
    hasPassword,
    username,
}: {
    hasPassword: boolean;
    username: string;
}) {
    const [password, setPassword] = useState('');
    const [usernameConfirm, setUsernameConfirm] = useState('');

    const isFormValid = hasPassword ? !!password : usernameConfirm === username;

    return (
        <SettingGroup
            icon={<Trash2 />}
            title="Delete Account"
            variant="destructive"
        >
            {({ setExpanded }) => (
                <>
                    <p className="text-muted-foreground mb-4 text-sm">
                        This action is permanent and cannot be undone. All your
                        projects and data will be permanently deleted.
                    </p>
                    <Form
                        action={route('profile.destroy')}
                        method="delete"
                        onSuccess={() => router.visit('/')}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {hasPassword ? (
                                    <FormField
                                        label="Enter your password to confirm"
                                        error={errors.password}
                                        required
                                    >
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </FormField>
                                ) : (
                                    <FormField
                                        label={`Type "${username}" to confirm`}
                                        error={errors.username}
                                        required
                                    >
                                        <Input
                                            type="text"
                                            name="username"
                                            placeholder={username}
                                            value={usernameConfirm}
                                            onChange={(e) =>
                                                setUsernameConfirm(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>
                                )}
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing || !isFormValid}
                                    >
                                        {processing
                                            ? 'Deleting...'
                                            : 'Delete Account'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setExpanded(false);
                                            setPassword('');
                                            setUsernameConfirm('');
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

interface OidcProvider {
    slug: string;
    name: string;
    linked: boolean;
    email?: string;
}

interface AccountPageProps extends PageProps {
    auth: {
        user: User & {
            username: string | null;
            has_password: boolean;
        };
    };
    authMode: 'simple' | 'production';
    oidc: {
        enabled: boolean;
        providers: OidcProvider[];
    };
    status?: string;
}

function LinkedAccountsSection({
    providers,
    hasPassword,
}: {
    providers: OidcProvider[];
    hasPassword: boolean;
}) {
    const handleLink = (slug: string) => {
        // Use full page navigation for OIDC redirect (required for external OAuth flow)
        window.location.href = route('oidc.link', { provider: slug });
    };

    const handleUnlink = (slug: string) => {
        if (!hasPassword) {
            alert(
                'Cannot unlink your only authentication method. Please set a password first.',
            );
            return;
        }
        if (confirm('Are you sure you want to unlink this provider?')) {
            router.delete(route('oidc.unlink', { provider: slug }));
        }
    };

    if (providers.length === 0) {
        return null;
    }

    return (
        <div className="border-border border">
            <div className="bg-muted/30 border-border border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <LinkIcon className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Linked Accounts</span>
                </div>
            </div>
            <div className="divide-border divide-y">
                {providers.map((provider) => (
                    <div
                        key={provider.slug}
                        className="flex items-center justify-between px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                                {provider.name}
                            </span>
                            {provider.linked && provider.email && (
                                <span className="text-muted-foreground text-xs">
                                    ({provider.email})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {provider.linked ? (
                                <>
                                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <Check className="h-3 w-3" />
                                        Linked
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive h-7 text-xs"
                                        onClick={() =>
                                            handleUnlink(provider.slug)
                                        }
                                    >
                                        <X className="mr-1 h-3 w-3" />
                                        Unlink
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleLink(provider.slug)}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Link
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Account(props: AccountPageProps) {
    const { user } = props.auth;
    const { authMode, oidc } = props;
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="bg-background min-h-svh">
            <header className="bg-background/80 border-border sticky top-0 z-40 w-full border-b backdrop-blur-sm">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
                    <Link
                        href={route('projects.index')}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm tracking-wider uppercase transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                    <h1 className="text-foreground text-sm font-medium tracking-[0.2em] uppercase">
                        {authMode === 'simple'
                            ? user.username || user.email
                            : user.email || user.username}
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
                        Account{' '}
                        <span className="ml-1 font-serif tracking-wide italic">
                            settings
                        </span>
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
                        <ChangePasswordSection
                            hasPassword={user.has_password}
                        />
                        {authMode === 'production' && <ResetPasswordSection />}
                    </div>
                </FormGroup>

                {/* Linked Accounts Section */}
                {oidc.enabled && oidc.providers.length > 0 && (
                    <FormGroup title="Linked Accounts" className="mb-12">
                        <LinkedAccountsSection
                            providers={oidc.providers}
                            hasPassword={user.has_password}
                        />
                    </FormGroup>
                )}

                {/* Danger Zone */}
                <FormGroup title="Danger Zone" className="mb-12">
                    <div>
                        <DeleteAccountSection
                            hasPassword={user.has_password}
                            username={user.username || ''}
                        />
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
                    <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                        About the App
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Open-source pattern management for makers
                    </p>
                    <a
                        href="https://github.com/balfiere/rowcounter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-border hover:bg-foreground hover:text-background flex w-full items-center justify-between border px-4 py-3 text-sm tracking-wider uppercase transition-all duration-300"
                    >
                        <span>View on GitHub</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </section>
            </main>
        </div>
    );
}
