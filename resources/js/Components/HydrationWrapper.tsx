import { useSyncHydration } from '../hooks/use-sync-hydration';

export function HydrationWrapper({ children }: { children: React.ReactNode }) {
    useSyncHydration();
    return <>{children}</>;
}
