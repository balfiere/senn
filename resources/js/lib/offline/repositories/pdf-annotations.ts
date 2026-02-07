import { db, type LocalPdfAnnotation } from '../db';
import { enqueueEvent } from '../outbox';

/**
 * Get annotations for a specific project.
 */
export async function getAnnotationsForProject(projectId: string): Promise<LocalPdfAnnotation[]> {
    return db.pdfAnnotations
        .where('project_id')
        .equals(projectId)
        .filter((a) => a.deleted_at === null)
        .toArray();
}

/**
 * Upsert annotations to local DB (from server data).
 */
export async function upsertAnnotations(annotations: LocalPdfAnnotation[]): Promise<void> {
    for (const a of annotations) {
        const existing = await db.pdfAnnotations.get(a.id);
        if (existing && existing._local_status === 'pending') {
            if (new Date(a.updated_at) <= new Date(existing.updated_at)) {
                continue;
            }
        }
        await db.pdfAnnotations.put({ ...a, _local_status: 'synced' });
    }
}

/**
 * Create or update an annotation locally and queue sync event.
 */
export async function upsertAnnotationLocally(annotation: Omit<LocalPdfAnnotation, '_local_status'>): Promise<void> {
    await db.pdfAnnotations.put({ ...annotation, _local_status: 'pending' });
    await enqueueEvent('pdf_annotation.upsert', { record: annotation });
}

/**
 * Soft-delete an annotation locally and queue sync event.
 */
export async function deleteAnnotationLocally(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    await db.pdfAnnotations.update(id, {
        deleted_at: deletedAt,
        updated_at: deletedAt,
        _local_status: 'pending',
    });
    await enqueueEvent('pdf_annotation.delete', { id, deleted_at: deletedAt });
}
