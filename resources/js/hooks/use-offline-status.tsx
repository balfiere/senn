import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}

function getSnapshot(): boolean {
    return navigator.onLine;
}

function getServerSnapshot(): boolean {
    return true; // SSR assumes online
}

/**
 * Hook to track online/offline status.
 * Uses useSyncExternalStore for React 18+ concurrent rendering compatibility.
 */
export function useOfflineStatus(): { isOnline: boolean; isOffline: boolean } {
    const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { isOnline, isOffline: !isOnline };
}
