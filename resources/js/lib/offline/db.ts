import Dexie, { type EntityTable } from 'dexie';

// Types matching server schema
export interface LocalProject {
    id: string;
    user_id: number;
    name: string;
    pdf_path: string | null;
    thumbnail_path: string | null;
    stopwatch_seconds: number;
    stopwatch_running: boolean;
    stopwatch_started_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // Local-only fields
    _local_status?: 'synced' | 'pending' | 'conflict';
    _local_pdf_blob?: Blob; // For offline PDF storage (Phase 8)
}

export interface LocalPart {
    id: string;
    project_id: string;
    name: string;
    position: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    _local_status?: 'synced' | 'pending' | 'conflict';
}

export interface LocalCounter {
    id: string;
    part_id: string;
    name: string;
    current_value: number;
    reset_at: number | null;
    reset_count: number;
    show_reset_count: boolean;
    is_global: boolean;
    is_linked: boolean;
    position: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    _local_status?: 'synced' | 'pending' | 'conflict';
}

export interface LocalCounterComment {
    id: string;
    counter_id: string;
    row_pattern: string;
    comment_text: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    _local_status?: 'synced' | 'pending' | 'conflict';
}

export interface LocalPdfAnnotation {
    id: string;
    project_id: string;
    embedpdf_annotation_id: string | null;
    page_number: number;
    annotation_type: string;
    position_x: number | null;
    position_y: number | null;
    width: number | null;
    height: number | null;
    color: string | null;
    fill_color: string | null;
    stroke_color: string | null;
    opacity: number | null;
    blend_mode: number | null;
    stroke_width: number | null;
    font_size: number | null;
    font_family: string | null;
    line_start_x: number | null;
    line_start_y: number | null;
    line_end_x: number | null;
    line_end_y: number | null;
    line_ending: string | null;
    line_start_ending: string | null;
    line_end_ending: string | null;
    contents: string | null;
    comment: string | null;
    in_reply_to_id: string | null;
    segment_rects: unknown | null;
    text_align: number | null;
    vertical_align: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    _local_status?: 'synced' | 'pending' | 'conflict';
}

export interface OutboxEvent {
    id?: number; // Auto-increment
    event_id: string; // UUID for idempotency
    type: string;
    payload: Record<string, unknown>;
    status: 'pending' | 'processing' | 'failed';
    attempts: number;
    created_at: string;
    last_attempt_at: string | null;
    error_message: string | null;
}

export interface SyncMetadata {
    key: string;
    value: string;
}

const db = new Dexie('rowcounter') as Dexie & {
    projects: EntityTable<LocalProject, 'id'>;
    parts: EntityTable<LocalPart, 'id'>;
    counters: EntityTable<LocalCounter, 'id'>;
    counterComments: EntityTable<LocalCounterComment, 'id'>;
    pdfAnnotations: EntityTable<LocalPdfAnnotation, 'id'>;
    outbox: EntityTable<OutboxEvent, 'id'>;
    syncMetadata: EntityTable<SyncMetadata, 'key'>;
};

db.version(1).stores({
    projects: 'id, user_id, updated_at, deleted_at',
    parts: 'id, project_id, updated_at, deleted_at',
    counters: 'id, part_id, updated_at, deleted_at',
    counterComments: 'id, counter_id, updated_at, deleted_at',
    pdfAnnotations: 'id, project_id, embedpdf_annotation_id, updated_at, deleted_at',
    outbox: '++id, event_id, status, created_at',
    syncMetadata: 'key',
});

export { db };
