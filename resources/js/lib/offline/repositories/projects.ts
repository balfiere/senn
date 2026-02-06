import { db, type LocalProject } from '../db';
import { enqueueEvent } from '../outbox';

/**
 * Get all non-deleted projects from local DB.
 */
export async function getLocalProjects(): Promise<LocalProject[]> {
    return db.projects.filter((p) => p.deleted_at === null).toArray();
}

/**
 * Get a single project by ID.
 */
export async function getLocalProject(id: string): Promise<LocalProject | undefined> {
    return db.projects.get(id);
}

/**
 * Upsert a project to local DB (from server data).
 * Used when hydrating from Inertia props.
 */
export async function upsertProject(project: LocalProject): Promise<void> {
    await db.projects.put({ ...project, _local_status: 'synced' });
}

/**
 * Upsert multiple projects to local DB.
 */
export async function upsertProjects(projects: LocalProject[]): Promise<void> {
    await db.projects.bulkPut(projects.map((p) => ({ ...p, _local_status: 'synced' })));
}

/**
 * Create a new project locally and queue sync event.
 */
export async function createProjectLocally(
    project: Omit<LocalProject, '_local_status'>
): Promise<void> {
    await db.projects.put({ ...project, _local_status: 'pending' });
    await enqueueEvent('project.upsert', { record: project });
}

/**
 * Update a project locally and queue sync event.
 */
export async function updateProjectLocally(
    id: string,
    updates: Partial<LocalProject>
): Promise<void> {
    const existing = await db.projects.get(id);
    if (!existing) return;

    const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
        _local_status: 'pending' as const,
    };
    await db.projects.put(updated);
    await enqueueEvent('project.upsert', { record: updated });
}

/**
 * Soft-delete a project locally and queue sync event.
 */
export async function deleteProjectLocally(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    await db.projects.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    await enqueueEvent('project.delete', { id, deleted_at: deletedAt });
}
