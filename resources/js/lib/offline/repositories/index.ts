// Re-export all repository functions
export {
    getLocalProjects,
    getLocalProject,
    upsertProject,
    upsertProjects,
    createProjectLocally,
    updateProjectLocally,
    deleteProjectLocally,
} from './projects';

export { getPartsForProject, upsertParts, createPartLocally, updatePartLocally, deletePartLocally } from './parts';

export {
    getCountersForPart,
    upsertCounters,
    incrementCounterLocally,
    decrementCounterLocally,
    resetCounterLocally,
    updateCounterLocally,
} from './counters';

export {
    getAnnotationsForProject,
    upsertAnnotations,
    upsertAnnotationLocally,
    deleteAnnotationLocally,
} from './pdf-annotations';
