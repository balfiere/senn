// Re-export all offline utilities for convenient imports
export { db } from './db';
export type {
    LocalProject,
    LocalPart,
    LocalCounter,
    LocalCounterComment,
    LocalPdfAnnotation,
    OutboxEvent,
    SyncMetadata,
} from './db';

export { enqueueEvent, getPendingEvents, getPendingCount, markCompleted, markFailed, retryFailed } from './outbox';

export { getSyncToken, setSyncToken, clearSyncToken, fetchNewToken, ensureSyncToken } from './sync-token';

export { getSyncState, subscribeSyncState, syncNow, initSyncEngine } from './sync-engine';
export type { SyncState } from './sync-engine';
