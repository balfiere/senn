import { Button } from '@/Components/ui/button';
import { Divider } from '@/Components/Auth/Divider';

interface OidcProvider {
    slug: string;
    name: string;
    button_text: string;
}

interface OidcButtonsProps {
    providers: OidcProvider[];
    className?: string;
}

export function OidcButtons({ providers, className = '' }: OidcButtonsProps) {
    if (!providers || providers.length === 0) {
        return null;
    }

    const handleLogin = (slug: string) => {
        // Use full page navigation for OIDC redirect (required for external OAuth flow)
        window.location.href = route('oidc.redirect', { provider: slug });
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
                    {provider.button_text}
                </Button>
            ))}
        </div>
    );
}