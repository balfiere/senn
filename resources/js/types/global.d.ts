import type { PageProps as InertiaPageProps } from '@inertiajs/react';
import type { AxiosInstance } from 'axios';
import type { route as ziggyRoute } from 'ziggy-js';

import type { db, syncNow } from '../lib/offline';

import type { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
        /** Database instance for offline storage (dev only) */
        db: typeof db;
        /** Trigger immediate sync (dev only) */
        syncNow: typeof syncNow;
        /** Full offline module for debugging (dev only) */
        offline: typeof import('../lib/offline');
    }

    var route: typeof ziggyRoute;
}

declare module '@inertiajs/react' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
