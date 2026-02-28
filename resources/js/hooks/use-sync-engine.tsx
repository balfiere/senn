import { useCallback, useSyncExternalStore } from 'react';

import {
    getSyncState,
    subscribeSyncState,
    syncNow,
    type SyncState,
} from '@/lib/offline';

function getServerSnapshot(): SyncState {
    return {
        status: 'idle',
        lastSyncAt: null,
        pendingCount: 0,
        error: null,
    };
}

/**
 * Hook to track sync engine state and trigger manual syncs.
 */
export function useSyncEngine() {
    const state = useSyncExternalStore(
        subscribeSyncState,
        getSyncState,
        getServerSnapshot,
    );

    const sync = useCallback(() => {
        syncNow();
    }, []);

    return {
        ...state,
        sync,
        isSyncing: state.status === 'syncing',
        hasError: state.status === 'error',
    };
}
