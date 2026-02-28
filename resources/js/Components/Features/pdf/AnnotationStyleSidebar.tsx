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
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignVerticalJustifyStart,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/Components/ui/button';
import { FormField } from '@/Components/ui/form-field';
import { FormGroup } from '@/Components/ui/form-group';
import { Label } from '@/Components/ui/label';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Select } from '@/Components/ui/select';
import { Slider } from '@/Components/ui/slider';
import { SliderField } from '@/Components/ui/slider-field';
import { cn } from '@/lib/utils';

import { ANNOTATION_COLORS, type AnnotationToolType } from './utils';

interface PdfAnnotation {
    id: string;
    type: number;
    pageIndex: number;
    color?: string;
    strokeColor?: string;
    fillColor?: string;
    opacity?: number;
    blendMode?: number;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: number;
    verticalAlign?: number;
    [key: string]: unknown;
}

interface TrackedAnnotation {
    object: PdfAnnotation;
    commitState?: unknown;
}

interface AnnotationTool {
    id: string;
    defaults?: Partial<PdfAnnotation>;
    [key: string]: unknown;
}

interface AnnotationApi {
    updateAnnotation: (pageIndex: number, id: string, patch: Partial<PdfAnnotation>) => void;
    setToolDefaults: (type: string, patch: Partial<PdfAnnotation>) => void;
    getActiveTool?: () => AnnotationTool;
    selectAnnotation?: (pageIndex: number, id: string) => void;
}

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
        <Button
            className={cn(
                'ring-ring h-4 w-4 rounded-sm border-none px-2 transition-all',
                active ? 'scale-115 ring-1' : 'hover:scale-110',
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
    selectedAnnotation: TrackedAnnotation | null;
    activeTool: AnnotationToolType | AnnotationTool;
}) {
    const { provides: annotationApi } = useAnnotationCapability() as {
        provides: AnnotationApi;
    };

    const annotation = selectedAnnotation?.object;
    const toolType =
        typeof activeTool === 'string' ? activeTool : activeTool?.id;
    const defaults =
        typeof activeTool === 'string' ? null : activeTool?.defaults;
    const editing = !!annotation;

    const baseColor = editing
        ? (annotation.color ?? annotation.strokeColor)
        : (defaults?.color ??
            ANNOTATION_COLORS.find((color) => color.name === 'Yellow')?.value ??
            '#000000');
    const baseOpacity = editing
        ? (annotation.opacity ?? 0.5)
        : (defaults?.opacity ?? 0.5);
    const baseBlendMode = editing
        ? (annotation.blendMode ?? PdfBlendMode.Normal)
        : (defaults?.blendMode ?? PdfBlendMode.Normal);

    const [color, setColor] = useState(baseColor ?? '#000000');
    const [opacity, setOpacity] = useState(baseOpacity);
    const [blendMode, setBlendMode] = useState(baseBlendMode);

    useEffect(() => {
        if (baseColor) {
            setColor(baseColor);
        }
    }, [baseColor]);
    useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
    useEffect(() => setBlendMode(baseBlendMode), [baseBlendMode]);

    if (!annotationApi) return null;

    const changeColor = (c: string) => {
        setColor(c);
        applyPatch({ color: c, strokeColor: c });
    };

    const changeOpacity = (o: number) => {
        setOpacity(o);
        applyPatch({ opacity: o });
    };

    const changeBlendMode = (bm: number) => {
        setBlendMode(bm);
        applyPatch({ blendMode: bm });
    };

    function applyPatch(patch: Partial<PdfAnnotation>) {
        if (!annotationApi) return;
        if (editing) {
            annotationApi.updateAnnotation(
                annotation.pageIndex,
                annotation.id,
                patch,
            );
        } else if (toolType) {
            annotationApi.setToolDefaults(toolType, patch);
        }
    }

    return (
        <FormGroup title="Text Markup">
            <div className="space-y-3">
                <Label className="text-xs font-medium">Color</Label>
                <div className="grid grid-cols-8 gap-1.5">
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

            <SliderField
                label="Opacity"
                value={opacity}
                onChange={changeOpacity}
                min={0.1}
                max={1}
                step={0.1}
                displayValue={(value) => `${Math.round(value * 100)}%`}
            />

            <FormField label="Blend Mode">
                <Select
                    value={blendMode}
                    onChange={(e) =>
                        changeBlendMode(parseInt(e.target.value, 10))
                    }
                >
                    {blendModeValues.map((mode) => (
                        <option key={mode} value={mode}>
                            {PdfBlendMode[mode] || `Mode ${mode}`}
                        </option>
                    ))}
                </Select>
            </FormField>
        </FormGroup>
    );
}

// Shape styling panel (square, circle)
function ShapePanel({
    selectedAnnotation,
    activeTool,
}: {
    selectedAnnotation: TrackedAnnotation | null;
    activeTool: AnnotationToolType | AnnotationTool;
}) {
    const { provides: annotationApi } = useAnnotationCapability() as {
        provides: AnnotationApi;
    };

    const annotation = selectedAnnotation?.object;
    const toolType =
        typeof activeTool === 'string' ? activeTool : activeTool?.id;
    const defaults =
        typeof activeTool === 'string' ? null : activeTool?.defaults;
    const editing = !!annotation;

    const baseFill = editing ? annotation.color : (defaults?.color ?? '#0000');
    const baseStroke = editing
        ? annotation.strokeColor
        : (defaults?.strokeColor ?? '#000000');
    const baseOpacity = editing ? (annotation.opacity ?? 1) : (defaults?.opacity ?? 1);
    const baseStrokeWidth = editing
        ? (annotation.strokeWidth ?? 2)
        : (defaults?.strokeWidth ?? 2);

    const [fill, setFill] = useState(baseFill ?? '#0000');
    const [stroke, setStroke] = useState(baseStroke ?? '#000000');
    const [opacity, setOpacity] = useState(baseOpacity);
    const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

    useEffect(() => {
        if (baseFill) {
            setFill(baseFill);
        }
    }, [baseFill]);
    useEffect(() => {
        if (baseStroke) {
            setStroke(baseStroke);
        }
    }, [baseStroke]);
    useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
    useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

    if (!annotationApi) return null;

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

    function applyPatch(patch: Partial<PdfAnnotation>) {
        if (!annotationApi) return;
        if (editing) {
            annotationApi.updateAnnotation(
                annotation.pageIndex,
                annotation.id,
                patch,
            );
        } else if (toolType) {
            annotationApi.setToolDefaults(toolType, patch);
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Label className="text-xs font-medium">Fill Color</Label>
                <div className="grid grid-cols-8 gap-1.5">
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
                <div className="grid grid-cols-8 gap-1.5">
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
    selectedAnnotation: TrackedAnnotation | null;
    activeTool: AnnotationTool | AnnotationToolType;
}) {
    const { provides: annotationApi } = (useAnnotationCapability() ?? {}) as {
        provides: AnnotationApi;
    };

    const annotation = selectedAnnotation?.object;
    const toolType =
        typeof activeTool === 'string' ? activeTool : activeTool?.id;
    const defaults =
        typeof activeTool === 'string' ? null : activeTool?.defaults;
    const editing = !!annotation;

    const baseFontColor = editing
        ? String(annotation.fontColor || '#00000')
        : String(defaults?.fontColor || '#000000');
    const baseOpacity = editing
        ? Number(annotation.opacity || 1)
        : Number(defaults?.opacity || 1);
    const baseFontSize = editing
        ? Number(annotation.fontSize || 14)
        : Number(defaults?.fontSize || 14);
    const baseFontFamily = editing
        ? String(annotation.fontFamily || 'Helvetica')
        : String(defaults?.fontFamily || 'Helvetica');
    const baseTextAlign = editing
        ? Number(annotation.textAlign ?? 0)
        : Number(defaults?.textAlign ?? 0);
    const baseVerticalAlign = editing
        ? Number(annotation.verticalAlign ?? 0)
        : Number(defaults?.verticalAlign ?? 0);

    const [fontColor, setFontColor] = useState(baseFontColor);
    const [opacity, setOpacity] = useState(baseOpacity);
    const [fontSize, setFontSize] = useState(baseFontSize);
    const [fontFamily, setFontFamily] = useState(baseFontFamily);
    const [textAlign, setTextAlign] = useState(baseTextAlign);
    const [verticalAlign, setVerticalAlign] = useState(baseVerticalAlign);

    useEffect(() => setFontColor(baseFontColor), [baseFontColor]);
    useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
    useEffect(() => setFontSize(baseFontSize), [baseFontSize]);
    useEffect(() => setFontFamily(baseFontFamily), [baseFontFamily]);
    useEffect(() => setTextAlign(baseTextAlign), [baseTextAlign]);
    useEffect(() => setVerticalAlign(baseVerticalAlign), [baseVerticalAlign]);

    if (!annotationApi) return null;

    const changeFontColor = (c: string) => {
        setFontColor(c);
        applyPatch({ fontColor: String(c) });
    };

    const changeOpacity = (o: number) => {
        setOpacity(o);
        applyPatch({ opacity: Number(o) });
    };

    const changeFontSize = (s: number) => {
        setFontSize(s);
        applyPatch({ fontSize: Number(s) });
    };

    const changeFontFamily = (family: string) => {
        setFontFamily(family);
        applyPatch({ fontFamily: String(family) });
    };

    const changeTextAlign = (align: number) => {
        setTextAlign(align);
        applyPatch({ textAlign: align });
    };

    const changeVerticalAlign = (align: number) => {
        setVerticalAlign(align);
        applyPatch({ verticalAlign: align });
    };

    function applyPatch(patch: Partial<PdfAnnotation>) {
        if (!annotationApi) return;
        if (editing) {
            annotationApi.updateAnnotation(
                annotation.pageIndex,
                annotation.id,
                patch,
            );
        } else if (toolType) {
            annotationApi.setToolDefaults(toolType, patch);
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Label className="text-xs font-medium">Font Color</Label>
                <div className="grid grid-cols-8 gap-1.5">
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

            <FormField label="Font Family">
                <Select
                    value={fontFamily}
                    onChange={(e) => changeFontFamily(e.target.value)}
                >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times-Roman">Times-Roman</option>
                    <option value="Courier">Courier</option>
                    <option value="Symbol">Symbol</option>
                    <option value="ZapfDingbats">ZapfDingbats</option>
                </Select>
            </FormField>

            <div className="space-y-3">
                <Label className="text-xs font-medium">Text Alignment</Label>
                <div className="flex gap-1.5">
                    <Button
                        variant={textAlign === 0 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeTextAlign(0)}
                        title="Left"
                    >
                        <AlignLeft size={16} />
                    </Button>
                    <Button
                        variant={textAlign === 1 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeTextAlign(1)}
                        title="Center"
                    >
                        <AlignCenter size={16} />
                    </Button>
                    <Button
                        variant={textAlign === 2 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeTextAlign(2)}
                        title="Right"
                    >
                        <AlignRight size={16} />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-medium">
                    Vertical Alignment
                </Label>
                <div className="flex gap-1.5">
                    <Button
                        variant={verticalAlign === 0 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeVerticalAlign(0)}
                        title="Top"
                    >
                        <AlignVerticalJustifyStart size={16} />
                    </Button>
                    <Button
                        variant={verticalAlign === 1 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeVerticalAlign(1)}
                        title="Middle"
                    >
                        <AlignVerticalJustifyCenter size={16} />
                    </Button>
                    <Button
                        variant={verticalAlign === 2 ? 'default' : 'outline'}
                        size="icon-xs"
                        onClick={() => changeVerticalAlign(2)}
                        title="Bottom"
                    >
                        <AlignVerticalJustifyEnd size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Line/arrow styling panel
function LinePanel({
    selectedAnnotation,
    activeTool,
}: {
    selectedAnnotation: TrackedAnnotation | null;
    activeTool: AnnotationToolType | AnnotationTool;
}) {
    const { provides: annotationApi } = useAnnotationCapability() as {
        provides: AnnotationApi;
    };

    const annotation = selectedAnnotation?.object;
    const toolType =
        typeof activeTool === 'string' ? activeTool : activeTool?.id;
    const defaults =
        typeof activeTool === 'string' ? null : activeTool?.defaults;
    const editing = !!annotation;

    const baseColor = editing
        ? annotation.strokeColor
        : (defaults?.strokeColor ?? '#000000');
    const baseOpacity = editing ? (annotation.opacity ?? 1) : (defaults?.opacity ?? 1);
    const baseStrokeWidth = editing
        ? (annotation.strokeWidth ?? 2)
        : (defaults?.strokeWidth ?? 2);

    const [color, setColor] = useState(baseColor ?? '#000000');
    const [opacity, setOpacity] = useState(baseOpacity);
    const [strokeWidth, setStrokeWidth] = useState(baseStrokeWidth);

    useEffect(() => {
        if (baseColor) {
            setColor(baseColor);
        }
    }, [baseColor]);
    useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
    useEffect(() => setStrokeWidth(baseStrokeWidth), [baseStrokeWidth]);

    if (!annotationApi) return null;

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

    function applyPatch(patch: Partial<PdfAnnotation>) {
        if (!annotationApi) return;
        if (editing) {
            annotationApi.updateAnnotation(
                annotation.pageIndex,
                annotation.id,
                patch,
            );
        } else if (toolType) {
            annotationApi.setToolDefaults(toolType, patch);
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Label className="text-xs font-medium">Color</Label>
                <div className="grid grid-cols-8 gap-1.5">
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
    activeTool?: AnnotationToolType;
}

export function AnnotationStyleSidebar({
    documentId,
    activeTool,
}: AnnotationStyleSidebarProps) {
    const { provides: annotationApi } = useAnnotationCapability() as {
        provides: AnnotationApi;
    };
    const { state: annotationState } = useAnnotation(documentId);
    if (!annotationApi || !annotationState) return null;

    // Get the selected annotation from the embedpdf state
    const selectedAnnotation = annotationState.selectedUid
        ? ({
            object: getAnnotationByUid(
                annotationState,
                annotationState.selectedUid,
            ),
        } as unknown as TrackedAnnotation)
        : null;

    // Use the passed activeTool prop for conditional logic, but still get the full tool object for functionality
    const currentActiveTool = activeTool && annotationApi.getActiveTool
        ? annotationApi.getActiveTool()
        : null;

    // Determine which panel to show based on annotation type or active tool
    let panelType: string;
    let title: string;

    if (selectedAnnotation && selectedAnnotation.object) {
        // If annotation is selected, use its type
        // TrackedAnnotation has: { commitState, object: { type, ... } }
        const annotationType = selectedAnnotation.object.type;

        switch (annotationType) {
            case PdfAnnotationSubtype.HIGHLIGHT:
            case PdfAnnotationSubtype.UNDERLINE:
            case PdfAnnotationSubtype.STRIKEOUT:
            case PdfAnnotationSubtype.SQUIGGLY:
                panelType = 'textMarkup';
                title = 'Styles';
                break;
            case PdfAnnotationSubtype.SQUARE:
                panelType = 'shape';
                title = 'Styles';
                break;
            case PdfAnnotationSubtype.LINE:
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
    } else if (activeTool && currentActiveTool) {
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
                panelType = 'shape';
                title = 'Defaults';
                break;
            case 'line':
            case 'lineArrow':
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
        <div className="flex h-full flex-col">
            <div className="border-border border-b p-3">
                <h3 className="text-sm font-medium">{title}</h3>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4">
                    {panelType === 'textMarkup' && (
                        <TextMarkupPanel
                            key={
                                selectedAnnotation?.object?.id ||
                                'default'
                            }
                            selectedAnnotation={selectedAnnotation}
                            activeTool={activeTool || (currentActiveTool as AnnotationTool)}
                        />
                    )}
                    {panelType === 'shape' && (
                        <ShapePanel
                            key={
                                selectedAnnotation?.object?.id ||
                                'default'
                            }
                            selectedAnnotation={selectedAnnotation}
                            activeTool={activeTool || (currentActiveTool as AnnotationTool)}
                        />
                    )}
                    {panelType === 'line' && (
                        <LinePanel
                            key={
                                selectedAnnotation?.object?.id ||
                                'default'
                            }
                            selectedAnnotation={selectedAnnotation}
                            activeTool={activeTool || (currentActiveTool as AnnotationTool)}
                        />
                    )}
                    {panelType === 'freeText' && (
                        <FreeTextPanel
                            key={
                                selectedAnnotation?.object?.id ||
                                'default'
                            }
                            selectedAnnotation={selectedAnnotation}
                            activeTool={activeTool || (currentActiveTool as AnnotationTool)}
                        />
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
