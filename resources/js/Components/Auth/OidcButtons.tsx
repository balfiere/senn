import { Divider } from '@/Components/Auth/Divider';
import { Button } from '@/Components/ui/button';

interface OidcProvider {
    slug: string;
    name: string;
}

interface OidcButtonsProps {
    providers: OidcProvider[];
    className?: string;
    /** The action verb: "in" for sign in, "up" for sign up */
    actionVerb?: 'in' | 'up';
}

export function OidcButtons({
    providers,
    className = '',
    actionVerb = 'in',
}: OidcButtonsProps) {
    if (!providers || providers.length === 0) {
        return null;
    }

    const handleLogin = (slug: string) => {
        // Use full page navigation for OIDC redirect (required for external OAuth flow)
        window.location.href = route('oidc.redirect', { provider: slug });
    };

    /**
     * Generate button text from provider name and action verb.
     * Example: name="Pocket ID", actionVerb="up" → "Sign up with Pocket ID"
     */
    const getButtonText = (provider: OidcProvider): string => {
        return `Sign ${actionVerb} with ${provider.name}`;
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <Divider>or</Divider>
            {providers.map((provider) => (
                <Button
                    key={provider.slug}
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleLogin(provider.slug)}
                >
                    <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    {getButtonText(provider)}
                </Button>
            ))}
        </div>
    );
}
