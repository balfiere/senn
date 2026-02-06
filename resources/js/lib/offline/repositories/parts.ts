import { db, type LocalPart } from '../db';
import { enqueueEvent } from '../outbox';

/**
 * Get parts for a specific project.
 */
export async function getPartsForProject(projectId: string): Promise<LocalPart[]> {
    return db.parts.where('project_id').equals(projectId).filter((p) => p.deleted_at === null).toArray();
}

/**
 * Upsert parts to local DB (from server data).
 */
export async function upsertParts(parts: LocalPart[]): Promise<void> {
    await db.parts.bulkPut(parts.map((p) => ({ ...p, _local_status: 'synced' })));
}

/**
 * Create a new part locally and queue sync event.
 */
export async function createPartLocally(part: Omit<LocalPart, '_local_status'>): Promise<void> {
    await db.parts.put({ ...part, _local_status: 'pending' });
    await enqueueEvent('part.upsert', { record: part });
}

/**
 * Update a part locally and queue sync event.
 */
export async function updatePartLocally(id: string, updates: Partial<LocalPart>): Promise<void> {
    const existing = await db.parts.get(id);
    if (!existing) return;

    const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
        _local_status: 'pending' as const,
    };

    await db.parts.put(updated);
    await enqueueEvent('part.upsert', { record: updated });
}

/**
 * Soft-delete a part locally and queue sync event.
 */
export async function deletePartLocally(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    await db.parts.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    await enqueueEvent('part.delete', { id, deleted_at: deletedAt });
}
