import { useLiveQuery } from 'dexie-react-hooks';
import { db, LocalProject, LocalPart, LocalPdfAnnotation } from '@/lib/offline/db';

export function useProjectData(
    initialProject: LocalProject,
    initialParts: any[] = [],
    initialAnnotations: LocalPdfAnnotation[] = []
) {
    return useLiveQuery(async () => {
        const project = await db.projects.get(initialProject.id);
        // If project not found locally (shouldn't happen if hydrated), fallback to initial
        if (!project) return {
            project: initialProject,
            parts: initialParts,
            annotations: initialAnnotations
        };

        const parts = await db.parts
            .where('project_id')
            .equals(project.id)
            .filter(p => !p.deleted_at)
            .toArray();

        parts.sort((a, b) => a.position - b.position);

        const partIds = parts.map(p => p.id);
        const counters = await db.counters
            .where('part_id')
            .anyOf(partIds)
            .filter(c => !c.deleted_at)
            .toArray();

        const counterIds = counters.map(c => c.id);
        const comments = await db.counterComments
            .where('counter_id')
            .anyOf(counterIds)
            .filter(c => !c.deleted_at)
            .toArray();

        // Stitch data locally to match the structure expected by the UI (Props)
        const partsWithCounters = parts.map(part => {
            const partCounters = counters.filter(c => c.part_id === part.id);
            partCounters.sort((a, b) => a.position - b.position);

            const countersWithComments = partCounters.map(counter => ({
                ...counter,
                comments: comments.filter(c => c.counter_id === counter.id)
            }));

            return {
                ...part,
                counters: countersWithComments
            };
        });

        const annotations = await db.pdfAnnotations
            .where('project_id')
            .equals(project.id)
            .filter(a => !a.deleted_at)
            .toArray();

        return {
            project,
            parts: partsWithCounters,
            annotations
        };
    }, [initialProject.id], {
        project: initialProject,
        parts: initialParts,
        annotations: initialAnnotations
    });
}
