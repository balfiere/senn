export interface User {
  id: number;
  name: string;
  email: string | null;
  email_verified_at?: string;
}

export interface Project {
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
  parts?: Part[];
}

export interface Part {
  id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
  counters?: Counter[];
}

export interface Counter {
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
  comments?: CounterComment[];
}

export interface CounterComment {
  id: string;
  counter_id: string;
  row_pattern: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface PdfAnnotation {
  id: string;
  project_id: string;
  embedpdf_annotation_id: string;
  page_number: number;
  annotation_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color: string | null;
  opacity: number;
  stroke_width: number;
  font_size: number;
  font_family: string | null;
  line_start_x: number | null;
  line_start_y: number | null;
  line_end_x: number | null;
  line_end_y: number | null;
  line_ending: string | null;
  contents: string | null;
  comment: string | null;
  segment_rects: unknown[] | null;
  fill_color: string | null;
  stroke_color: string | null;
  blend_mode: number;
  line_start_ending: string | null;
  line_end_ending: string | null;
  in_reply_to_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  auth: {
    user: User;
  };
  flash: {
    success: string | null;
    error: string | null;
  };
};
