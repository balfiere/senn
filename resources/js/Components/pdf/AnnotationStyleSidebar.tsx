import { Label } from '@/Components/ui/label';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Slider } from '@/Components/ui/slider';
import { cn } from '@/lib/utils';
import {
  PdfAnnotationSubtype,
  PdfBlendMode,
  blendModeValues,
} from '@embedpdf/models';
import { getAnnotationByUid } from '@embedpdf/plugin-annotation';
import {
  useAnnotation,
  useAnnotationCapability,
} from '@embedpdf/plugin-annotation/react';
import { useEffect, useState } from 'react';
import { ANNOTATION_COLORS, type AnnotationToolType } from './utils';

// Utility component for color swatches
function ColorSwatch({
  color,
  active,
  onSelect,
}: {
  color: string;
  active: boolean;
  onSelect: (color: string) => void;
}) {
  const isTransparent = color === 'transparent';
  return (
    <button
      className={cn(
        'h-6 w-6 rounded border-2 transition-all',
        active
          ? 'border-primary scale-110'
          : 'border-transparent hover:scale-105',
      )}
      style={{
        backgroundColor: isTransparent ? '#fff' : color,
        backgroundImage: isTransparent
          ? 'linear-gradient(45deg, transparent 40%, red 40%, red 60%, transparent 60%)'
          : undefined,
      }}
      onClick={() => onSelect(color)}
      title={color}
    />
  );
}

// Utility component for sliders with labels
function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  displayValue,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  displayValue?: (value: number) => string;
}) {
  const display = displayValue
    ? displayValue(value)
    : suffix
      ? `${value}${suffix}`
      : `${value}`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-muted-foreground text-xs">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

// Text markup styling panel (highlight, underline, strikeout, squiggly)
function TextMarkupPanel({
  documentId,
  selectedAnnotation,
  activeTool,
}: {
  documentId: string;
  selectedAnnotation: { object: unknown } | null;
  activeTool: AnnotationToolType;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object as
    | Record<string, unknown>
    | undefined;
  const annotationObject = annotation?.object as
    | Record<string, unknown>
    | undefined;
  const editing = !!annotation;

  const baseColor = editing
    ? (annotationObject?.color as string)
    : ANNOTATION_COLORS.find((color) => color.name === 'Yellow')?.value ??
      '#000000';
  const baseOpacity = editing
    ? ((annotationObject?.opacity as number) ?? 0.5)
    : 0.5;
  const baseBlendMode = editing
    ? ((annotationObject?.blendMode as number) ?? PdfBlendMode.Normal)
    : PdfBlendMode.Normal;

  const [color, setColor] = useState(baseColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [blendMode, setBlendMode] = useState(baseBlendMode);

  useEffect(() => setColor(baseColor), [baseColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setBlendMode(baseBlendMode), [baseBlendMode]);

  const applyPatch = (patch: Partial<Record<string, unknown>>) => {
    if (!annotationApi) return;
    if (editing && annotationObject) {
      annotationApi.updateAnnotation(
        annotationObject.pageIndex as number,
        annotationObject.id as string,
        patch,
      );
    } else {
      annotationApi.setToolDefaults(activeTool, patch);
    }
  };

  const changeColor = (c: string) => {
    setColor(c);
    applyPatch({ color: c });
  };

  const changeOpacity = (o: number) => {
    setOpacity(o);
    applyPatch({ opacity: o });
  };

  const changeBlendMode = (bm: number) => {
    setBlendMode(bm);
    applyPatch({ blendMode: bm });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-xs font-medium">Color</Label>
        <div className="grid grid-cols-8 gap-1">
          {ANNOTATION_COLORS.map((colorOption) => (
            <ColorSwatch
              key={colorOption.value}
              color={colorOption.value}
              active={color === colorOption.value}
              onSelect={changeColor}
            />
          ))}
        </div>
      </div>

      <SliderControl
        label="Opacity"
        value={opacity}
        onChange={changeOpacity}
        min={0.1}
        max={1}
        step={0.1}
        displayValue={(value) => `${Math.round(value * 100)}%`}
      />

      <div className="space-y-2">
        <Label className="text-xs">Blend Mode</Label>
        <select
          className="border-input bg-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-1 focus-visible:outline-none"
          value={blendMode}
          onChange={(e) => changeBlendMode(parseInt(e.target.value, 10))}
        >
          {blendModeValues.map((mode) => (
            <option key={mode} value={mode}>
              {PdfBlendMode[mode] || `Mode ${mode}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Shape styling panel (square, circle)
function ShapePanel({
  documentId,
  selectedAnnotation,
  activeTool,
}: {
  documentId: string;
  selectedAnnotation: { object: unknown } | null;
  activeTool: AnnotationToolType;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object as
    | Record<string, unknown>
    | undefined;
  const annotationObject = annotation?.object as
    | Record<string, unknown>
    | undefined;
  const editing = !!annotation;

  const baseFill = editing
    ? (annotationObject?.color as string)
    : '#000000';
  const baseStroke = editing
    ? (annotationObject?.strokeColor as string)
    : '#000000';
  const baseOpacity = editing
    ? (annotationObject?.opacity as number)
    : 1;
  const baseStrokeWidth = editing
    ? (annotationObject?.strokeWidth as number)
    : 2;

  const [fill, setFill] = useState(baseFill);
  const [stroke, setStroke] = useState(baseStroke);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

  useEffect(() => setFill(baseFill), [baseFill]);
  useEffect(() => setStroke(baseStroke), [baseStroke]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

  const applyPatch = (patch: Partial<Record<string, unknown>>) => {
    if (!annotationApi) return;
    if (editing && annotationObject) {
      annotationApi.updateAnnotation(
        annotationObject.pageIndex as number,
        annotationObject.id as string,
        patch,
      );
    } else {
      annotationApi.setToolDefaults(activeTool, patch);
    }
  };

  const changeFill = (c: string) => {
    setFill(c);
    applyPatch({ color: c });
  };

  const changeStroke = (c: string) => {
    setStroke(c);
    applyPatch({ strokeColor: c });
  };

  const changeOpacity = (o: number) => {
    setOpacity(o);
    applyPatch({ opacity: o });
  };

  const changeStrokeWidth = (w: number) => {
    setStrokeWidth(w);
    applyPatch({ strokeWidth: w });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-xs font-medium">Fill Color</Label>
        <div className="grid grid-cols-8 gap-1">
          {ANNOTATION_COLORS.map((colorOption) => (
            <ColorSwatch
              key={colorOption.value}
              color={colorOption.value}
              active={fill === colorOption.value}
              onSelect={changeFill}
            />
          ))}
          <ColorSwatch
            color="transparent"
            active={fill === 'transparent'}
            onSelect={changeFill}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium">Stroke Color</Label>
        <div className="grid grid-cols-8 gap-1">
          {ANNOTATION_COLORS.map((colorOption) => (
            <ColorSwatch
              key={colorOption.value}
              color={colorOption.value}
              active={stroke === colorOption.value}
              onSelect={changeStroke}
            />
          ))}
        </div>
      </div>

      <SliderControl
        label="Opacity"
        value={opacity}
        onChange={changeOpacity}
        min={0.1}
        max={1}
        step={0.1}
        displayValue={(value) => `${Math.round(value * 100)}%`}
      />

      <SliderControl
        label="Stroke Width"
        value={strokeWidth}
        onChange={changeStrokeWidth}
        min={1}
        max={8}
        step={1}
        suffix="px"
      />
    </div>
  );
}

// Free text styling panel
function FreeTextPanel({
  documentId,
  selectedAnnotation,
  activeTool,
}: {
  documentId: string;
  selectedAnnotation: { object: unknown } | null;
  activeTool: AnnotationToolType;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object as
    | Record<string, unknown>
    | undefined;
  const annotationObject = annotation?.object as
    | Record<string, unknown>
    | undefined;
  const editing = !!annotation;

  const baseFontColor = editing
    ? (annotationObject?.fontColor as string)
    : '#000000';
  const baseOpacity = editing
    ? (annotationObject?.opacity as number)
    : 1;
  const baseFontSize = editing
    ? (annotationObject?.fontSize as number)
    : 14;

  const [fontColor, setFontColor] = useState(baseFontColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [fontSize, setFontSize] = useState(baseFontSize);

  useEffect(() => setFontColor(baseFontColor), [baseFontColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setFontSize(baseFontSize), [baseFontSize]);

  const applyPatch = (patch: Partial<Record<string, unknown>>) => {
    if (!annotationApi) return;
    if (editing && annotationObject) {
      annotationApi.updateAnnotation(
        annotationObject.pageIndex as number,
        annotationObject.id as string,
        patch,
      );
    } else {
      annotationApi.setToolDefaults(activeTool, patch);
    }
  };

  const changeFontColor = (c: string) => {
    setFontColor(c);
    applyPatch({ fontColor: c });
  };

  const changeOpacity = (o: number) => {
    setOpacity(o);
    applyPatch({ opacity: o });
  };

  const changeFontSize = (s: number) => {
    setFontSize(s);
    applyPatch({ fontSize: s });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-xs font-medium">Font Color</Label>
        <div className="grid grid-cols-8 gap-1">
          {ANNOTATION_COLORS.map((colorOption) => (
            <ColorSwatch
              key={colorOption.value}
              color={colorOption.value}
              active={fontColor === colorOption.value}
              onSelect={changeFontColor}
            />
          ))}
        </div>
      </div>

      <SliderControl
        label="Opacity"
        value={opacity}
        onChange={changeOpacity}
        min={0.1}
        max={1}
        step={0.1}
        displayValue={(value) => `${Math.round(value * 100)}%`}
      />

      <SliderControl
        label="Font Size"
        value={fontSize}
        onChange={changeFontSize}
        min={8}
        max={32}
        step={1}
        suffix="px"
      />
    </div>
  );
}

// Line/arrow styling panel
function LinePanel({
  documentId,
  selectedAnnotation,
  activeTool,
}: {
  documentId: string;
  selectedAnnotation: { object: unknown } | null;
  activeTool: AnnotationToolType;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object as
    | Record<string, unknown>
    | undefined;
  const annotationObject = annotation?.object as
    | Record<string, unknown>
    | undefined;
  const editing = !!annotation;

  const baseColor = editing
    ? (annotationObject?.strokeColor as string)
    : '#000000';
  const baseOpacity = editing
    ? (annotationObject?.opacity as number)
    : 1;
  const baseStrokeWidth = editing
    ? (annotationObject?.strokeWidth as number)
    : 2;

  const [color, setColor] = useState(baseColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

  useEffect(() => setColor(baseColor), [baseColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

  const applyPatch = (patch: Partial<Record<string, unknown>>) => {
    if (!annotationApi) return;
    if (editing && annotationObject) {
      annotationApi.updateAnnotation(
        annotationObject.pageIndex as number,
        annotationObject.id as string,
        patch,
      );
    } else {
      annotationApi.setToolDefaults(activeTool, patch);
    }
  };

  const changeColor = (c: string) => {
    setColor(c);
    applyPatch({ strokeColor: c });
  };

  const changeOpacity = (o: number) => {
    setOpacity(o);
    applyPatch({ opacity: o });
  };

  const changeStrokeWidth = (w: number) => {
    setStrokeWidth(w);
    applyPatch({ strokeWidth: w });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-xs font-medium">Color</Label>
        <div className="grid grid-cols-8 gap-1">
          {ANNOTATION_COLORS.map((colorOption) => (
            <ColorSwatch
              key={colorOption.value}
              color={colorOption.value}
              active={color === colorOption.value}
              onSelect={changeColor}
            />
          ))}
        </div>
      </div>

      <SliderControl
        label="Opacity"
        value={opacity}
        onChange={changeOpacity}
        min={0.1}
        max={1}
        step={0.1}
        displayValue={(value) => `${Math.round(value * 100)}%`}
      />

      <SliderControl
        label="Stroke Width"
        value={strokeWidth}
        onChange={changeStrokeWidth}
        min={1}
        max={8}
        step={1}
        suffix="px"
      />
    </div>
  );
}

// Main annotation style sidebar component
interface AnnotationStyleSidebarProps {
  documentId: string;
  activeTool: AnnotationToolType;
}

export function AnnotationStyleSidebar({
  documentId,
  activeTool,
}: AnnotationStyleSidebarProps) {
  const { provides: annotationApi } = useAnnotationCapability();
  const { state: annotationState } = useAnnotation(documentId);
  if (!annotationApi || !annotationState) return null;

  // Get the selected annotation from the embedpdf state
  const selectedAnnotation = annotationState.selectedUid
    ? {
        object: getAnnotationByUid(
          annotationState,
          annotationState.selectedUid,
        ) as unknown,
      }
    : null;

  // Determine which panel to show based on annotation type or active tool
  let panelType: string;
  let title: string;

  if (selectedAnnotation && selectedAnnotation.object) {
    // If annotation is selected, use its type
    const annotationType = (
      selectedAnnotation.object as Record<string, unknown>
    )?.object as Record<string, unknown> | undefined;
    const type = annotationType?.type as number | undefined;

    switch (type) {
      case PdfAnnotationSubtype.HIGHLIGHT:
      case PdfAnnotationSubtype.UNDERLINE:
      case PdfAnnotationSubtype.STRIKEOUT:
      case PdfAnnotationSubtype.SQUIGGLY:
        panelType = 'textMarkup';
        title = 'Styles';
        break;
      case PdfAnnotationSubtype.SQUARE:
      case PdfAnnotationSubtype.CIRCLE:
        panelType = 'shape';
        title = 'Styles';
        break;
      case PdfAnnotationSubtype.LINE:
      case PdfAnnotationSubtype.POLYLINE:
      case PdfAnnotationSubtype.POLYGON:
        panelType = 'line';
        title = 'Styles';
        break;
      case PdfAnnotationSubtype.FREETEXT:
        panelType = 'freeText';
        title = 'Styles';
        break;
      default:
        return (
          <div className="text-muted-foreground p-4 text-center text-sm">
            No styling options available for this annotation type.
          </div>
        );
    }
  } else if (activeTool && activeTool !== 'select') {
    // If no annotation selected, use active tool type
    switch (activeTool) {
      case 'highlight':
      case 'underline':
      case 'strikeout':
      case 'squiggly':
        panelType = 'textMarkup';
        title = 'Defaults';
        break;
      case 'square':
      case 'circle':
        panelType = 'shape';
        title = 'Defaults';
        break;
      case 'line':
      case 'lineArrow':
      case 'polyline':
      case 'polygon':
        panelType = 'line';
        title = 'Defaults';
        break;
      case 'freeText':
        panelType = 'freeText';
        title = 'Defaults';
        break;
      default:
        return (
          <div className="text-muted-foreground p-4 text-center text-sm">
            Select an annotation tool to configure defaults.
          </div>
        );
    }
  } else {
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">
        Select an annotation tool or annotation to configure styling.
      </div>
    );
  }

  const annotationObj = selectedAnnotation?.object as Record<
    string,
    unknown
  > | null;
  const innerObj = annotationObj?.object as Record<string, unknown> | undefined;
  const key = (innerObj?.id as string) || 'default';

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-3">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {panelType === 'textMarkup' && (
            <TextMarkupPanel
              key={key}
              documentId={documentId}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'shape' && (
            <ShapePanel
              key={key}
              documentId={documentId}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'line' && (
            <LinePanel
              key={key}
              documentId={documentId}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'freeText' && (
            <FreeTextPanel
              key={key}
              documentId={documentId}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}