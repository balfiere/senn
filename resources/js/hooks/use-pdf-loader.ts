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
        };
    }, [projectId, serverPdfUrl, projectUpdatedAt]);

    // Separate effect for revoking the URL on unmount or refresh
    useEffect(() => {
        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl]);

    return { pdfBlobUrl, isLoading, error };
}
