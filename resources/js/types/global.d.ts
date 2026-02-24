import type { PageProps as InertiaPageProps } from '@inertiajs/react';
import type { AxiosInstance } from 'axios';
import type { route as ziggyRoute } from 'ziggy-js';

import type { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    var route: typeof ziggyRoute;
}

declare module '@inertiajs/react' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
