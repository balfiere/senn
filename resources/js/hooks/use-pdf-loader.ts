import { useEffect, useState } from 'react';

import { db } from '@/lib/offline/db';

interface UsePdfLoaderResult {
    pdfBlobUrl: string | null;
    isLoading: boolean;
    error: Error | null;
}

export function usePdfLoader(
    projectId: string,
    serverPdfUrl: string | null,
    projectUpdatedAt: string,
): UsePdfLoaderResult {
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!projectId || !serverPdfUrl) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const loadPdf = async () => {
            try {
                // 1. Check local cache
                const project = await db.projects.get(projectId);

                // If we have a stored blob and it's fresh enough (based on updated_at)
                if (
                    project &&
                    project._local_pdf_blob &&
                    project._local_pdf_updated_at === projectUpdatedAt
                ) {
                    if (isMounted) {
                        const url = URL.createObjectURL(
                            project._local_pdf_blob,
                        );
                        setPdfBlobUrl(url);
                        setIsLoading(false);
                    }
                    return;
                }

                // 2. Fetch from network
                const response = await fetch(serverPdfUrl);
                if (!response.ok) throw new Error('Failed to fetch PDF');

                const blob = await response.blob();

                // 3. Update local cache
                await db.projects.update(projectId, {
                    _local_pdf_blob: blob,
                    _local_pdf_updated_at: projectUpdatedAt,
                });

                if (isMounted) {
                    const url = URL.createObjectURL(blob);
                    setPdfBlobUrl(url);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error loading PDF:', err);
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err
                            : new Error('Unknown error loading PDF'),
                    );
                    setIsLoading(false);
                }
            }
        };

        loadPdf();

        return () => {
            isMounted = false;
            // Cleanup object URL to prevent memory leaks?
            // Note: If we revoke it here, we might break the current view if the component unmounts/remounts quickly
            // But strict mode might trigger this.
            // For now, rely on garbage collection or standard browser behavior for Blob URLs from IDB?
            // Actually, created Object URLs should be revoked.
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl, projectId, serverPdfUrl, projectUpdatedAt]);

    return { pdfBlobUrl, isLoading, error };
}
