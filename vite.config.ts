import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx', 'resources/js/pwa/sw.ts'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: null,
            manifest: false,
            strategies: 'injectManifest',
            srcDir: 'resources/js/pwa',
            filename: 'sw.ts',
            injectManifest: {
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
            },
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
