import type {
    LocalCounter,
    LocalPart,
    LocalPdfAnnotation,
    LocalProject,
} from '@/lib/offline/db';
import {
    upsertAnnotations,
    upsertCounters,
    upsertParts,
    upsertProject,
    upsertProjects,
} from '@/lib/offline/repositories';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface PageProps {
    projects?: LocalProject[];
    project?: LocalProject;
    parts?: (LocalPart & { counters?: LocalCounter[] })[];
    pdfAnnotations?: LocalPdfAnnotation[];
    [key: string]: unknown;
}

export function useSyncHydration() {
    const { props } = usePage<PageProps>();

    useEffect(() => {
        const hydrate = async () => {
            // Hydrate Projects List
            if (props.projects && Array.isArray(props.projects)) {
                await upsertProjects(props.projects);
            }

            // Hydrate Single Project
            if (props.project) {
                await upsertProject(props.project);
            }

            // Hydrate Parts and Nested Counters
            if (props.parts && Array.isArray(props.parts)) {
                // Separate parts and counters
                const parts: LocalPart[] = [];
                const counters: LocalCounter[] = [];

                props.parts.forEach((p) => {
                    // Extract part data

                    const { counters: partCounters, ...partData } = p;
                    parts.push(partData);

                    // Extract counters if present
                    if (partCounters && Array.isArray(partCounters)) {
                        counters.push(...partCounters);
                    }
                });

                if (parts.length > 0) await upsertParts(parts);
                if (counters.length > 0) await upsertCounters(counters);
            }

            // Hydrate PDF Annotations
            if (props.pdfAnnotations && Array.isArray(props.pdfAnnotations)) {
                await upsertAnnotations(props.pdfAnnotations);
            }
        };

        hydrate().catch((err) => console.error('[Hydration] Error:', err));
    }, [props]);
}
