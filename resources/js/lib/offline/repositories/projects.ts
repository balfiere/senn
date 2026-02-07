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
    const existing = await db.projects.get(project.id);
    if (existing && existing._local_status === 'pending') {
        // Skip if local has pending changes (or check timestamps if more robust)
        if (new Date(project.updated_at) <= new Date(existing.updated_at)) {
            return;
        }
    }
    await db.projects.put({ ...project, _local_status: 'synced' });
}

/**
 * Upsert multiple projects to local DB.
 */
export async function upsertProjects(projects: LocalProject[]): Promise<void> {
    for (const p of projects) {
        await upsertProject(p);
    }
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
    await db.projects.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    await enqueueEvent('project.delete', { id, deleted_at: deletedAt });
}

/**
 * Toggle stopwatch state locally.
 */
export async function toggleStopwatchLocally(id: string): Promise<void> {
    const project = await db.projects.get(id);
    if (!project) return;

    const now = new Date();
    const updates: Partial<LocalProject> = { updated_at: now.toISOString(), _local_status: 'pending' };

    if (project.stopwatch_running && project.stopwatch_started_at) {
        // Stop
        const start = new Date(project.stopwatch_started_at).getTime();
        const elapsed = Math.max(0, Math.floor((now.getTime() - start) / 1000));
        updates.stopwatch_seconds = (project.stopwatch_seconds || 0) + elapsed;
        updates.stopwatch_running = false;
        updates.stopwatch_started_at = null;
    } else {
        // Start
        updates.stopwatch_running = true;
        updates.stopwatch_started_at = now.toISOString();
        // stopwatch_seconds remains same
    }

    await db.projects.update(id, updates);
    await enqueueEvent('project.upsert', { record: { ...project, ...updates } });
}

/**
 * Reset stopwatch locally.
 */
export async function resetStopwatchLocally(id: string): Promise<void> {
    const project = await db.projects.get(id);
    if (!project) return;

    const updates: Partial<LocalProject> = {
        stopwatch_seconds: 0,
        stopwatch_running: false,
        stopwatch_started_at: null,
        updated_at: new Date().toISOString(),
        _local_status: 'pending',
    };

    await db.projects.update(id, updates);
    await enqueueEvent('project.upsert', { record: { ...project, ...updates } });
}
