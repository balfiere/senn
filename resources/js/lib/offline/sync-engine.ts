import { db } from './db';
import { getPendingEvents, markCompleted, markFailed, markProcessing, resetProcessing, getPendingCount } from './outbox';
import { getSyncToken, fetchNewToken } from './sync-token';

const SYNC_DEBOUNCE_MS = 1_000;
const SYNC_INTERVAL_MS = 30_000;

export interface SyncState {
    status: 'idle' | 'syncing' | 'error';
    lastSyncAt: string | null;
    pendingCount: number;
    error: string | null;
}

let syncState: SyncState = {
    status: 'idle',
    lastSyncAt: null,
    pendingCount: 0,
    error: null,
};

const listeners = new Set<(state: SyncState) => void>();

/**
 * Get current sync state snapshot.
 */
export function getSyncState(): SyncState {
    return { ...syncState };
}

/**
 * Subscribe to sync state changes.
 */
export function subscribeSyncState(listener: (state: SyncState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function updateState(partial: Partial<SyncState>): void {
    syncState = { ...syncState, ...partial };
    listeners.forEach((l) => l(syncState));
}

/**
 * Update the pending count from the outbox.
 */
async function refreshPendingCount(): Promise<void> {
    const count = await getPendingCount();
    updateState({ pendingCount: count });
}

/**
 * Trigger a sync operation (push + pull).
 */
export async function syncNow(): Promise<void> {
    if (syncState.status === 'syncing') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    updateState({ status: 'syncing', error: null });

    try {
        // Reset any stuck processing events from a previous crash
        await resetProcessing();

        await pushEvents();
        await pullChanges();

        await refreshPendingCount();
        updateState({ status: 'idle', lastSyncAt: new Date().toISOString() });
    } catch (error) {
        await refreshPendingCount();
        updateState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Sync failed',
        });
    }
}

/**
 * Push pending outbox events to the server.
 */
async function pushEvents(): Promise<void> {
    const token = (await getSyncToken()) ?? (await fetchNewToken());
    if (!token) throw new Error('No sync token available');

    const events = await getPendingEvents();
    if (events.length === 0) return;

    // Mark as processing to prevent double-sends
    const ids = events.map((e) => e.id!);
    await markProcessing(ids);

    const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            events: events.map((e) => ({
                event_id: e.event_id,
                type: e.type,
                payload: e.payload,
            })),
        }),
    });

    if (!response.ok) {
        // Mark all back to pending for retry
        for (const e of events) {
            await markFailed(e.event_id, `Push failed: ${response.status}`);
        }
        throw new Error(`Push failed: ${response.status}`);
    }

    const result = await response.json();

    // Mark successfully applied events as complete
    const successEventIds = events
        .slice(0, result.applied + result.duplicate)
        .map((e) => e.event_id);
    await markCompleted(successEventIds);

    // Handle errors
    for (const err of result.errors || []) {
        await markFailed(err.event_id, err.message);
    }
}

/**
 * Pull changes from the server since last sync.
 */
async function pullChanges(): Promise<void> {
    const token = await getSyncToken();
    if (!token) return;

    const lastSync = (await db.syncMetadata.get('last_sync_cursor'))?.value;

    const params = new URLSearchParams();
    if (lastSync) params.set('since', lastSync);

    const response = await fetch(`/api/sync/pull?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Pull failed: ${response.status}`);

    const data = await response.json();

    // Apply changes to local DB with conflict resolution (later timestamp wins)
    await db.transaction(
        'rw',
        [db.projects, db.parts, db.counters, db.counterComments, db.pdfAnnotations],
        async () => {
            for (const project of data.projects ?? []) {
                await upsertWithConflictResolution(db.projects, project);
            }
            for (const part of data.parts ?? []) {
                await upsertWithConflictResolution(db.parts, part);
            }
            for (const counter of data.counters ?? []) {
                await upsertWithConflictResolution(db.counters, counter);
            }
            for (const comment of data.counter_comments ?? []) {
                await upsertWithConflictResolution(db.counterComments, comment);
            }
            for (const annotation of data.pdf_annotations ?? []) {
                await upsertWithConflictResolution(db.pdfAnnotations, annotation);
            }
        }
    );

    // Update cursor
    await db.syncMetadata.put({ key: 'last_sync_cursor', value: data.cursor });
}

/**
 * Upsert with later-timestamp conflict resolution.
 * Server data wins if its updated_at is >= local updated_at.
 */
async function upsertWithConflictResolution<T extends { id: string; updated_at: string }>(
    table: { get(id: string): Promise<T | undefined>; put(item: T & { _local_status: string }): Promise<unknown> },
    serverRecord: T
): Promise<void> {
    const local = await table.get(serverRecord.id);

    if (local) {
        const localTime = new Date(local.updated_at).getTime();
        const serverTime = new Date(serverRecord.updated_at).getTime();

        // Later timestamp wins (server wins on tie)
        if (serverTime >= localTime) {
            await table.put({ ...serverRecord, _local_status: 'synced' });
        }
        // Otherwise keep local version (it's newer)
    } else {
        await table.put({ ...serverRecord, _local_status: 'synced' });
    }
}

/**
 * Debounced trigger to sync soon after an event is enqueued.
 * Multiple rapid calls will collapse into a single syncNow() after the debounce window.
 */
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncSoon(): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
        syncDebounceTimer = null;
        syncNow();
    }, SYNC_DEBOUNCE_MS);
}

/**
 * Initialize sync engine - auto-sync when coming back online,
 * periodically, and on startup.
 */
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

export function initSyncEngine(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
        syncNow();
    });

    // Periodic sync as a fallback safety net
    if (syncIntervalId) clearInterval(syncIntervalId);
    syncIntervalId = setInterval(() => {
        if (navigator.onLine) syncNow();
    }, SYNC_INTERVAL_MS);

    // Initial pending count + flush any events from previous sessions
    refreshPendingCount();
    if (navigator.onLine) {
        syncNow();
    }
}
