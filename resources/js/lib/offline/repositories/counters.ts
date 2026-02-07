import { db, type LocalCounter, type LocalCounterComment } from '../db';
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
    for (const c of counters) {
        const existing = await db.counters.get(c.id);
        if (existing && existing._local_status === 'pending') {
            if (new Date(c.updated_at) <= new Date(existing.updated_at)) {
                continue;
            }
        }
        await db.counters.put({ ...c, _local_status: 'synced' });
    }
}

/**
 * Increment a counter locally and queue sync event.
 */
export async function incrementCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    await db.transaction('rw', db.counters, async () => {
        const updatedAt = new Date().toISOString();

        // 1. Increment the triggering counter
        await incrementSingle(counter, updatedAt);

        // 2. If global, propagate to linked counters in the same part
        if (counter.is_global) {
            const linkedCounters = await db.counters
                .where('part_id')
                .equals(counter.part_id)
                .filter(c => c.is_linked && c.id !== counter.id && c.deleted_at === null)
                .toArray();

            for (const linked of linkedCounters) {
                await incrementSingle(linked, updatedAt);
            }
        }
    });

    await enqueueEvent('counter.increment', { counter_id: id });
}

async function incrementSingle(counter: LocalCounter, updatedAt: string): Promise<void> {
    let newValue = (counter.current_value || 0) + 1;
    let newResetCount = counter.reset_count || 0;

    // Handle auto-reset logic (1-based counting for patterns)
    if (counter.reset_at && newValue > counter.reset_at) {
        newValue = 1;
        newResetCount++;
    }

    await db.counters.update(counter.id, {
        current_value: newValue,
        reset_count: newResetCount,
        updated_at: updatedAt,
        _local_status: 'pending',
    });
}

/**
 * Decrement a counter locally and queue sync event.
 */
export async function decrementCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    await db.transaction('rw', db.counters, async () => {
        const updatedAt = new Date().toISOString();

        // 1. Decrement the triggering counter
        await decrementSingle(counter, updatedAt);

        // 2. If global, propagate to linked counters in the same part
        if (counter.is_global) {
            const linkedCounters = await db.counters
                .where('part_id')
                .equals(counter.part_id)
                .filter(c => c.is_linked && c.id !== counter.id && c.deleted_at === null)
                .toArray();

            for (const linked of linkedCounters) {
                await decrementSingle(linked, updatedAt);
            }
        }
    });

    await enqueueEvent('counter.decrement', { counter_id: id });
}

async function decrementSingle(counter: LocalCounter, updatedAt: string): Promise<void> {
    // Minimum value is 1 for primary/global, or 0? 
    // Backend says if ($counter->current_value > 1) { $counter->current_value--; }
    if (counter.current_value > 1) {
        await db.counters.update(counter.id, {
            current_value: counter.current_value - 1,
            updated_at: updatedAt,
            _local_status: 'pending',
        });
    }
}

/**
 * Reset a counter locally and queue sync event.
 */
export async function resetCounterLocally(id: string): Promise<void> {
    const counter = await db.counters.get(id);
    if (!counter) return;

    const updatedAt = new Date().toISOString();

    // Backend ResetCounterAction: sets value to 1 and reset_count to 0
    await db.counters.update(id, {
        current_value: 1,
        reset_count: 0,
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

/**
 * Create a new counter locally and queue sync event.
 */
export async function createCounterLocally(counter: Omit<LocalCounter, '_local_status'>): Promise<void> {
    await db.counters.put({ ...counter, _local_status: 'pending' });
    await enqueueEvent('counter.upsert', { record: counter });
}

/**
 * Delete a counter locally and queue sync event.
 */
export async function deleteCounterLocally(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    await db.counters.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    // Soft delete related comments ? Usually backend handles cascade, but for local UI consistency we might want to hide them.
    // Ideally we iterate and soft-delete comments too, but for now just the counter.
    await enqueueEvent('counter.delete', { id, deleted_at: deletedAt });
}

// --- Comments ---



/**
 * Create a counter comment locally.
 */
export async function createCounterCommentLocally(comment: Omit<LocalCounterComment, '_local_status'>): Promise<void> {
    await db.counterComments.put({ ...comment, _local_status: 'pending' });
    await enqueueEvent('counter_comment.upsert', { record: comment });
}

/**
 * Delete a counter comment locally.
 */
export async function deleteCounterCommentLocally(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    await db.counterComments.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    await enqueueEvent('counter_comment.delete', { id, deleted_at: deletedAt });
}

/**
 * Get all comments for a set of counter IDs (helper for hydration/queries).
 */
export async function getCommentsForCounters(counterIds: string[]): Promise<LocalCounterComment[]> {
    return db.counterComments
        .where('counter_id')
        .anyOf(counterIds)
        .filter(c => !c.deleted_at)
        .toArray();
}
