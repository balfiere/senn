import { PdfAnnotationSubtype, PdfBlendMode } from '@embedpdf/models';

// Map numeric annotation subtypes to string names for storage
export const ANNOTATION_TYPE_MAP: Record<number, string> = {
  [PdfAnnotationSubtype.TEXT]: 'text',
  [PdfAnnotationSubtype.LINK]: 'link',
  [PdfAnnotationSubtype.FREETEXT]: 'freeText',
  [PdfAnnotationSubtype.LINE]: 'line',
  [PdfAnnotationSubtype.SQUARE]: 'square',
  [PdfAnnotationSubtype.CIRCLE]: 'circle',
  [PdfAnnotationSubtype.POLYGON]: 'polygon',
  [PdfAnnotationSubtype.POLYLINE]: 'polyline',
  [PdfAnnotationSubtype.HIGHLIGHT]: 'highlight',
  [PdfAnnotationSubtype.UNDERLINE]: 'underline',
  [PdfAnnotationSubtype.STRIKEOUT]: 'strikeout',
  [PdfAnnotationSubtype.SQUIGGLY]: 'squiggly',
  [PdfAnnotationSubtype.STAMP]: 'stamp',
  [PdfAnnotationSubtype.CARET]: 'caret',
  [PdfAnnotationSubtype.INK]: 'ink',
  [PdfAnnotationSubtype.POPUP]: 'popup',
  [PdfAnnotationSubtype.FILEATTACHMENT]: 'fileAttachment',
  [PdfAnnotationSubtype.SOUND]: 'sound',
  [PdfAnnotationSubtype.MOVIE]: 'movie',
  [PdfAnnotationSubtype.WIDGET]: 'widget',
  [PdfAnnotationSubtype.SCREEN]: 'screen',
  [PdfAnnotationSubtype.PRINTERMARK]: 'printerMark',
  [PdfAnnotationSubtype.TRAPNET]: 'trapNet',
  [PdfAnnotationSubtype.WATERMARK]: 'watermark',
  [PdfAnnotationSubtype.THREED]: 'threeD',
  [PdfAnnotationSubtype.RICHMEDIA]: 'richMedia',
};

// Reverse map for converting string names back to numeric subtypes
export const STRING_TO_ANNOTATION_TYPE: Record<string, number> = Object.entries(
  ANNOTATION_TYPE_MAP,
).reduce((acc, [key, value]) => ({ ...acc, [value]: parseInt(key) }), {});

// Map numeric line ending types to string names for storage
// EmbedPDF uses numeric enums for line endings
export const LINE_ENDING_MAP: Record<number, string> = {
  0: 'None',
  1: 'Square',
  2: 'Circle',
  3: 'Diamond',
  4: 'OpenArrow',
  5: 'ClosedArrow',
  6: 'Butt',
  7: 'ROpenArrow',
  8: 'RClosedArrow',
  9: 'Slash',
};

// Reverse map for converting string names back to numeric line endings
export const STRING_TO_LINE_ENDING: Record<string, number> = Object.entries(
  LINE_ENDING_MAP,
).reduce((acc, [key, value]) => ({ ...acc, [value]: parseInt(key) }), {});

// Helper function to convert line ending value to string
export function lineEndingToString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return LINE_ENDING_MAP[value] || 'None';
  }
  return 'None';
}

// Helper function to convert line ending string back to number
export function lineEndingToNumber(value: string | null | undefined): number {
  if (!value) return 0; // None
  return STRING_TO_LINE_ENDING[value] ?? 0;
}

// Catppuccin Mocha palette - harmonious with pastel lavender
export const ANNOTATION_COLORS = [
  { name: 'Rosewater', value: '#f5e0dc' },
  { name: 'Flamingo', value: '#f2cdcd' },
  { name: 'Pink', value: '#f5c2e7' },
  { name: 'Mauve', value: '#cba6f7' },
  { name: 'Red', value: '#f38ba8' },
  { name: 'Maroon', value: '#eba0ac' },
  { name: 'Peach', value: '#fab387' },
  { name: 'Yellow', value: '#f9e2af' },
  { name: 'Green', value: '#a6e3a1' },
  { name: 'Teal', value: '#94e2d5' },
  { name: 'Sky', value: '#89dceb' },
  { name: 'Blue', value: '#89b4fa' },
  { name: 'Lavender', value: '#b4befe' },
  { name: 'White', value: '#cdd6f4' },
  { name: 'Gray', value: '#6c7086' },
  { name: 'Black', value: '#1e1e2e' },
];

export type AnnotationToolType =
  | 'select'
  | 'highlight'
  | 'underline'
  | 'strikeout'
  | 'squiggly'
  | 'freeText'
  | 'square'
  | 'line'
  | 'lineArrow';

export interface AnnotationSettings {
  color: string;
  opacity: number;
  blendMode: number;
  fontSize: number;
  strokeWidth: number;
}

// StoredAnnotation - local state representation (not extending PdfAnnotation to avoid type conflicts)
export interface StoredAnnotation {
  id: string;
  project_id: string;
  localId: string;
  embedpdf_annotation_id: string;
  page_number: number;
  annotation_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color: string | null;
  fill_color: string | null;
  stroke_color: string | null;
  opacity: number;
  blend_mode: number;
  stroke_width: number;
  font_size: number;
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
  segment_rects: unknown[] | null;
  created_at: string;
  updated_at: string;
}

// Database annotation type (matches Laravel schema)
export interface DbAnnotation {
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
  fill_color?: string | null;
  stroke_color?: string | null;
  opacity: number;
  blend_mode: number;
  stroke_width: number;
  font_size: number;
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
  segment_rects: unknown[] | null;
  created_at: string;
  updated_at: string;
}

// Convert embedpdf annotation to DB format for API requests
export function annotationToDbFormat(
  annotation: unknown,
  projectId: string,
  pageIndex: number,
): Partial<DbAnnotation> {
  const ann = annotation as Record<string, unknown>;
  // For merged annotations from update events, use the top-level properties first
  // Fall back to annotation.object for original structure
  const obj =
    ann.object && !ann.strokeColor && !ann.color
      ? (ann.object as Record<string, unknown>)
      : ann;

  // Convert numeric annotation type to string name
  const annotationTypeNum = (obj.type ?? obj.annotationType) as
    | number
    | string
    | undefined;
  const annotationTypeStr =
    typeof annotationTypeNum === 'number'
      ? ANNOTATION_TYPE_MAP[annotationTypeNum] || 'unknown'
      : (annotationTypeNum as string) || 'unknown';

  const rect = obj.rect as
    | {
        origin?: { x: number; y: number };
        size?: { width: number; height: number };
      }
    | undefined;
  const position = obj.position as { x: number; y: number } | undefined;
  const dimensions = obj.dimensions as
    | { width: number; height: number }
    | undefined;
  const linePoints = obj.linePoints as
    | { start?: { x: number; y: number }; end?: { x: number; y: number } }
    | undefined;
  const lineEndings = obj.lineEndings as
    | { start?: string; end?: string }
    | undefined;

  const baseData: Partial<DbAnnotation> = {
    project_id: projectId,
    embedpdf_annotation_id: obj.id as string,
    page_number: pageIndex + 1, // Convert to 1-based
    annotation_type: annotationTypeStr,
    position_x: rect?.origin?.x || position?.x || 0,
    position_y: rect?.origin?.y || position?.y || 0,
    width: rect?.size?.width || dimensions?.width || 0,
    height: rect?.size?.height || dimensions?.height || 0,
    opacity: (obj.opacity as number) ?? 1.0,
    blend_mode: (obj.blendMode as number) ?? 0,
    stroke_width:
      (obj.borderWidth as number) || (obj.strokeWidth as number) || 1,
    font_size: (obj.fontSize as number) || 14,
    font_family: (obj.fontFamily as string) || 'Helvetica',
    line_start_x: linePoints?.start?.x ?? null,
    line_start_y: linePoints?.start?.y ?? null,
    line_end_x: linePoints?.end?.x ?? null,
    line_end_y: linePoints?.end?.y ?? null,
    line_ending: (obj.lineEnding as string) || null,
    line_start_ending: lineEndingToString(
      lineEndings?.start ?? obj.lineStartEnding ?? obj.lineEndStarting,
    ),
    line_end_ending: lineEndingToString(lineEndings?.end ?? obj.lineEndEnding),
    contents: (obj.contents as string) || null,
    comment: (obj.comment as string) || null,
    in_reply_to_id: (obj.inReplyToId as string) || null,
    segment_rects: (obj.segmentRects as unknown[]) || null,
  };

  // Set colors based on annotation type
  if (
    ['highlight', 'underline', 'strikeout', 'squiggly'].includes(
      annotationTypeStr,
    )
  ) {
    // Text markup annotations: use color for markup color
    return {
      ...baseData,
      color: (obj.color as string) || '#cba6f7',
    };
  } else if (['square', 'circle'].includes(annotationTypeStr)) {
    // Shape annotations: separate fill and stroke colors
    return {
      ...baseData,
      fill_color: (obj.color as string) || 'transparent',
      stroke_color:
        (obj.strokeColor as string) || (obj.color as string) || '#000000',
    };
  } else if (
    ['line', 'lineArrow', 'polyline', 'polygon'].includes(annotationTypeStr)
  ) {
    // Line annotations: use stroke color
    return {
      ...baseData,
      stroke_color:
        (obj.strokeColor as string) || (obj.color as string) || '#000000',
    };
  } else if (annotationTypeStr === 'freeText') {
    // FreeText annotations: use color for text color
    return {
      ...baseData,
      color: (obj.fontColor as string) || '#000000',
    };
  }

  // Fallback for unknown types
  return { ...baseData, color: (obj.color as string) || '#cba6f7' };
}

// Convert DB annotation to embedpdf format for import
export function dbAnnotationToEmbedpdf(
  dbAnnotation: DbAnnotation,
): { annotation: Record<string, unknown>; ctx?: undefined } | null {
  try {
    // Convert string annotation type back to numeric enum for embedpdf
    const annotationTypeNum =
      STRING_TO_ANNOTATION_TYPE[dbAnnotation.annotation_type] ?? 0;

    // Build rect object (required by embedpdf)
    const rect = {
      origin: { x: dbAnnotation.position_x, y: dbAnnotation.position_y },
      size: { width: dbAnnotation.width, height: dbAnnotation.height },
    };

    // Create the annotation object
    const annotationObj: Record<string, unknown> = {
      id: dbAnnotation.embedpdf_annotation_id,
      pageIndex: dbAnnotation.page_number - 1, // Convert to 0-based
      type: annotationTypeNum,
      rect: rect,
      color: dbAnnotation.color,
      opacity: dbAnnotation.opacity ?? 1.0,
      blendMode: dbAnnotation.blend_mode ?? 0,
      author: 'User',
      inReplyToId: dbAnnotation.in_reply_to_id,
      created: new Date(),
      modified: new Date(),
    };

    // Text markup annotations need segmentRects
    if (
      ['highlight', 'underline', 'strikeout', 'squiggly'].includes(
        dbAnnotation.annotation_type,
      )
    ) {
      if (dbAnnotation.segment_rects) {
        annotationObj.segmentRects = dbAnnotation.segment_rects;
      } else {
        // Fallback for annotations created before segment_rects column was added
        annotationObj.segmentRects = [rect];
      }
    }

    // Set colors based on annotation type
    if (
      ['highlight', 'underline', 'strikeout', 'squiggly'].includes(
        dbAnnotation.annotation_type,
      )
    ) {
      annotationObj.color = dbAnnotation.color || '#cba6f7';
    } else if (['square', 'circle'].includes(dbAnnotation.annotation_type)) {
      annotationObj.color = dbAnnotation.fill_color || 'transparent';
      annotationObj.strokeColor =
        dbAnnotation.stroke_color || dbAnnotation.color || '#000000';
      annotationObj.strokeWidth = dbAnnotation.stroke_width ?? 1;
      annotationObj.strokeStyle = 1; // Solid stroke style
    } else if (
      ['line', 'lineArrow', 'polyline', 'polygon'].includes(
        dbAnnotation.annotation_type,
      )
    ) {
      annotationObj.strokeColor =
        dbAnnotation.stroke_color || dbAnnotation.color || '#000000';
      annotationObj.strokeWidth = dbAnnotation.stroke_width ?? 1;
      annotationObj.strokeStyle = 1;
    } else if (dbAnnotation.annotation_type === 'freeText') {
      annotationObj.fontColor = dbAnnotation.color || '#000000';
    }

    // FreeText specific
    if (
      dbAnnotation.annotation_type === 'freeText' &&
      dbAnnotation.font_size !== null
    ) {
      annotationObj.fontSize = dbAnnotation.font_size;
      annotationObj.fontFamily = dbAnnotation.font_family || 'Helvetica';
      if (dbAnnotation.contents !== null) {
        annotationObj.contents = dbAnnotation.contents;
      }
    }

    // Line/arrow specific
    if (
      (dbAnnotation.annotation_type === 'line' ||
        dbAnnotation.annotation_type === 'lineArrow') &&
      dbAnnotation.line_start_x !== null &&
      dbAnnotation.line_end_x !== null
    ) {
      annotationObj.linePoints = {
        start: { x: dbAnnotation.line_start_x, y: dbAnnotation.line_start_y },
        end: { x: dbAnnotation.line_end_x, y: dbAnnotation.line_end_y },
      };

      const startEnding = dbAnnotation.line_start_ending || 'None';
      const endEnding =
        dbAnnotation.line_end_ending ||
        (dbAnnotation.annotation_type === 'lineArrow' ? 'OpenArrow' : 'None');

      annotationObj.lineEndings = {
        start: lineEndingToNumber(startEnding),
        end: lineEndingToNumber(endEnding),
      };
    }

    return {
      annotation: annotationObj,
      ctx: undefined,
    };
  } catch (error) {
    console.error('Error converting annotation:', error);
    return null;
  }
}

// Default annotation settings
export const DEFAULT_ANNOTATION_SETTINGS: AnnotationSettings = {
  color: ANNOTATION_COLORS[3].value, // Mauve
  opacity: 0.5,
  blendMode: PdfBlendMode.Multiply,
  fontSize: 14,
  strokeWidth: 2,
};
