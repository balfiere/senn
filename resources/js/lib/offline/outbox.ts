import { v4 as uuid } from 'uuid';
import { db, type OutboxEvent } from './db';

/**
 * Enqueue a new sync event to the outbox.
 * Returns the event_id for tracking.
 */
export async function enqueueEvent(
    type: string,
    payload: Record<string, unknown>
): Promise<string> {
    const eventId = uuid();
    await db.outbox.add({
        event_id: eventId,
        type,
        payload,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        last_attempt_at: null,
        error_message: null,
    });
    return eventId;
}

/**
 * Get pending events ready for sync, ordered by creation time.
 */
export async function getPendingEvents(limit = 50): Promise<OutboxEvent[]> {
    return db.outbox.where('status').equals('pending').limit(limit).sortBy('created_at');
}

/**
 * Get count of pending events.
 */
export async function getPendingCount(): Promise<number> {
    return db.outbox.where('status').equals('pending').count();
}

/**
 * Mark events as currently being processed.
 */
export async function markProcessing(ids: number[]): Promise<void> {
    await db.outbox.where('id').anyOf(ids).modify({ status: 'processing' });
}

/**
 * Mark events as successfully synced (removes from outbox).
 */
export async function markCompleted(eventIds: string[]): Promise<void> {
    await db.outbox.where('event_id').anyOf(eventIds).delete();
}

/**
 * Mark an event as failed with error message.
 */
export async function markFailed(eventId: string, error: string): Promise<void> {
    await db.outbox.where('event_id').equals(eventId).modify((event) => {
        event.status = 'failed';
        event.attempts += 1;
        event.last_attempt_at = new Date().toISOString();
        event.error_message = error;
    });
}

/**
 * Retry all failed events by marking them as pending.
 */
export async function retryFailed(): Promise<void> {
    await db.outbox.where('status').equals('failed').modify({ status: 'pending' });
}

/**
 * Reset processing events back to pending (for recovery after crash).
 */
export async function resetProcessing(): Promise<void> {
    await db.outbox.where('status').equals('processing').modify({ status: 'pending' });
}
