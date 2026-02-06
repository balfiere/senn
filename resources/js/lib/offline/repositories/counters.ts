import { db, type LocalCounter } from '../db';
import { enqueueEvent } from '../outbox';

/**
 * Get counters for a specific part.
 */
export async function getCountersForPart(partId: string): Promise<LocalCounter[]> {
    return db.counters.where('part_id').equals(partId).filter((c) => c.deleted_at === null).toArray();
}

/**
 * Upsert counters to local DB (from server data).
 */
export async function upsertCounters(counters: LocalCounter[]): Promise<void> {
    await db.counters.bulkPut(counters.map((c) => ({ ...c, _local_status: 'synced' })));
}

/**
 * Increment a counter locally and queue sync event.
 */
export async function incrementCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    const newValue = counter.current_value + 1;
    const updatedAt = new Date().toISOString();

    await db.counters.update(id, {
        current_value: newValue,
        updated_at: updatedAt,
        _local_status: 'pending',
    });

    await enqueueEvent('counter.increment', { counter_id: id });
}

/**
 * Decrement a counter locally and queue sync event.
 */
export async function decrementCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter || counter.current_value <= 0) return;

    const newValue = counter.current_value - 1;
    const updatedAt = new Date().toISOString();

    await db.counters.update(id, {
        current_value: newValue,
        updated_at: updatedAt,
        _local_status: 'pending',
    });

    await enqueueEvent('counter.decrement', { counter_id: id });
}

/**
 * Reset a counter locally and queue sync event.
 */
export async function resetCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    const updatedAt = new Date().toISOString();

    await db.counters.update(id, {
        current_value: 0,
        reset_count: counter.reset_count + 1,
        updated_at: updatedAt,
        _local_status: 'pending',
    });

    await enqueueEvent('counter.reset', { counter_id: id });
}

/**
 * Update counter value locally and queue sync event.
 */
export async function updateCounterLocally(id: string, updates: Partial<LocalCounter>): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    const updated = {
        ...counter,
        ...updates,
        updated_at: new Date().toISOString(),
        _local_status: 'pending' as const,
    };

    await db.counters.put(updated);
    await enqueueEvent('counter.upsert', { record: updated });
}
