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
  selectedAnnotation,
  activeTool,
}: {
  selectedAnnotation: any;
  activeTool: any;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object;
  const defaults = activeTool?.defaults;
  const editing = !!annotation;

  const baseColor = editing ? annotation.object.color : (defaults?.color ?? ANNOTATION_COLORS.find((color) => color.name === 'Yellow')?.value ?? '#000000');
  const baseOpacity = editing ? (annotation.object.opacity ?? 0.5) : (defaults?.opacity ?? 0.5);
  const baseBlendMode = editing ? (annotation.object.blendMode ?? PdfBlendMode.Normal) : (defaults?.blendMode ?? PdfBlendMode.Normal);

  const [color, setColor] = useState(baseColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [blendMode, setBlendMode] = useState(baseBlendMode);

  useEffect(() => setColor(baseColor), [baseColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setBlendMode(baseBlendMode), [baseBlendMode]);

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

  function applyPatch(patch: Partial<any>) {
    if (!annotationApi) return;
    if (editing) {
      annotationApi.updateAnnotation(annotation.object.pageIndex, annotation.object.id, patch);
    } else if (activeTool) {
      annotationApi.setToolDefaults(activeTool.id, patch);
    }
  }

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
  selectedAnnotation,
  activeTool,
}: {
  selectedAnnotation: any;
  activeTool: any;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object;
  const defaults = activeTool?.defaults;
  const editing = !!annotation;

  const baseFill = editing ? annotation.object.color : (defaults?.color ?? '#000000');
  const baseStroke = editing ? annotation.object.strokeColor : (defaults?.strokeColor ?? '#000000');
  const baseOpacity = editing ? annotation.object.opacity : (defaults?.opacity ?? 1);
  const baseStrokeWidth = editing ? annotation.object.strokeWidth : (defaults?.strokeWidth ?? 2);

  const [fill, setFill] = useState(baseFill);
  const [stroke, setStroke] = useState(baseStroke);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

  useEffect(() => setFill(baseFill), [baseFill]);
  useEffect(() => setStroke(baseStroke), [baseStroke]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

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

  function applyPatch(patch: Partial<any>) {
    if (!annotationApi) return;
    if (editing) {
      annotationApi.updateAnnotation(annotation.object.pageIndex, annotation.object.id, patch);
    } else if (activeTool) {
      annotationApi.setToolDefaults(activeTool.id, patch);
    }
  }

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
  selectedAnnotation,
  activeTool,
}: {
  selectedAnnotation: any;
  activeTool: any;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object;
  const defaults = activeTool?.defaults;
  const editing = !!annotation;

  const baseFontColor = editing ? annotation.object.fontColor : (defaults?.fontColor ?? '#000000');
  const baseOpacity = editing ? annotation.object.opacity : (defaults?.opacity ?? 1);
  const baseFontSize = editing ? annotation.object.fontSize : (defaults?.fontSize ?? 14);

  const [fontColor, setFontColor] = useState(baseFontColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [fontSize, setFontSize] = useState(baseFontSize);

  useEffect(() => setFontColor(baseFontColor), [baseFontColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setFontSize(baseFontSize), [baseFontSize]);

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

  function applyPatch(patch: Partial<any>) {
    if (!annotationApi) return;
    if (editing) {
      annotationApi.updateAnnotation(annotation.object.pageIndex, annotation.object.id, patch);
    } else if (activeTool) {
      annotationApi.setToolDefaults(activeTool.id, patch);
    }
  }

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
  selectedAnnotation,
  activeTool,
}: {
  selectedAnnotation: any;
  activeTool: any;
}) {
  const { provides: annotationApi } = useAnnotationCapability();
  if (!annotationApi) return null;

  const annotation = selectedAnnotation?.object;
  const defaults = activeTool?.defaults;
  const editing = !!annotation;

  const baseColor = editing ? annotation.object.strokeColor : (defaults?.strokeColor ?? '#000000');
  const baseOpacity = editing ? annotation.object.opacity : (defaults?.opacity ?? 1);
  const baseStrokeWidth = editing ? annotation.object.strokeWidth : (defaults?.strokeWidth ?? 2);

  const [color, setColor] = useState(baseColor);
  const [opacity, setOpacity] = useState(baseOpacity);
  const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

  useEffect(() => setColor(baseColor), [baseColor]);
  useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
  useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

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

  function applyPatch(patch: Partial<any>) {
    if (!annotationApi) return;
    if (editing) {
      annotationApi.updateAnnotation(annotation.object.pageIndex, annotation.object.id, patch);
    } else if (activeTool) {
      annotationApi.setToolDefaults(activeTool.id, patch);
    }
  }

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
}

export function AnnotationStyleSidebar({ documentId }: AnnotationStyleSidebarProps) {
  const { provides: annotationApi } = useAnnotationCapability();
  const { state: annotationState } = useAnnotation(documentId);
  if (!annotationApi || !annotationState) return null;

  // Get the selected annotation and active tool from the embedpdf state
  const selectedAnnotation = annotationState.selectedUid
    ? { object: getAnnotationByUid(annotationState, annotationState.selectedUid) }
    : null;

  const activeTool = annotationApi.getActiveTool ? annotationApi.getActiveTool() : null;

  // Determine which panel to show based on annotation type or active tool
  let panelType: string;
  let title: string;

  if (selectedAnnotation && selectedAnnotation.object) {
    // If annotation is selected, use its type
    // TrackedAnnotation has: { commitState, object: { type, ... } }
    const annotationType = (selectedAnnotation.object as any).object?.type;

    switch (annotationType) {
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
  } else if (activeTool) {
    // If no annotation selected, use active tool type
    switch (activeTool.id) {
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {panelType === 'textMarkup' && (
            <TextMarkupPanel
              key={selectedAnnotation?.object?.object?.id || 'default'}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'shape' && (
            <ShapePanel
              key={selectedAnnotation?.object?.object?.id || 'default'}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'line' && (
            <LinePanel
              key={selectedAnnotation?.object?.object?.id || 'default'}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
          {panelType === 'freeText' && (
            <FreeTextPanel
              key={selectedAnnotation?.object?.object?.id || 'default'}
              selectedAnnotation={selectedAnnotation}
              activeTool={activeTool}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}