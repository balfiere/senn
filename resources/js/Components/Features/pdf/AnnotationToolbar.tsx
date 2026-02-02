import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { useAnnotation } from '@embedpdf/plugin-annotation/react';
import { usePan } from '@embedpdf/plugin-pan/react';
import { useScroll } from '@embedpdf/plugin-scroll/react';
import { useSearch } from '@embedpdf/plugin-search/react';
import { ZoomMode } from '@embedpdf/plugin-zoom';
import { useZoom } from '@embedpdf/plugin-zoom/react';
import {
  ArrowRight,
  Hand,
  Highlighter,
  MessageSquare,
  Minus,
  Moon,
  MousePointer2,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  Square,
  Sun,
  Type,
  Underline,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { type AnnotationSettings, type AnnotationToolType } from './utils';
import { useToolbarBreakpoint } from '@/hooks/useToolbarBreakpoint';
import { AnnotationToolsMenu } from './AnnotationToolsMenu';

interface AnnotationToolbarProps {
  documentId: string;
  activeTool: AnnotationToolType;
  setActiveTool: (tool: AnnotationToolType) => void;
  settings: AnnotationSettings;
  setSettings: (settings: AnnotationSettings) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  leftSidebarTab: 'thumbnails' | 'bookmarks' | 'styles';
  setLeftSidebarTab: (tab: 'thumbnails' | 'bookmarks' | 'styles') => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  setRightSidebarTab: (tab: 'comments' | 'search') => void;
  rightSidebarTab: 'comments' | 'search';
  onSearchBarVisibilityChange?: (hidden: boolean) => void;
  closeSidebars?: () => void;
}

export function AnnotationToolbar({
  documentId,
  activeTool,
  setActiveTool,
  settings,
  setSettings,
  searchQuery,
  onSearch,
  zoom,
  setZoom,
  darkMode,
  setDarkMode,
  leftSidebarOpen,
  setLeftSidebarOpen,
  leftSidebarTab,
  setLeftSidebarTab,
  rightSidebarOpen,
  setRightSidebarOpen,
  isMobile,
  setRightSidebarTab,
  rightSidebarTab,
  onSearchBarVisibilityChange,
  closeSidebars,
}: AnnotationToolbarProps) {
  const { provides: annotationApi, state: annotationState } =
    useAnnotation(documentId);
  const { provides: zoomApi, state: zoomState } = useZoom(documentId);
  const { provides: searchApi, state: searchState } = useSearch(documentId);
  const { provides: scrollApi } = useScroll(documentId);
  const { provides: panApi, isPanning } = usePan(documentId);

  const {
    showAnnotationTools,
    showResetZoom,
    showSearchBar,
    showZoomControls,
  } = useToolbarBreakpoint();

  // Notify parent when search bar visibility changes
  useEffect(() => {
    onSearchBarVisibilityChange?.(!showSearchBar || isMobile);
  }, [showSearchBar, isMobile, onSearchBarVisibilityChange]);

  useEffect(() => {
    if (!zoomState || zoomState.currentZoomLevel == null) return;
    const percent = Math.round(zoomState.currentZoomLevel * 100);
    if (percent !== zoom) {
      setZoom(percent);
    }
  }, [zoomState, zoom, setZoom]);

  // Synchronize active tool from plugin state
  useEffect(() => {
    if (!annotationApi) return;

    const pluginActiveTool = annotationApi.getActiveTool
      ? annotationApi.getActiveTool()
      : null;
    const expectedToolId = pluginActiveTool
      ? (pluginActiveTool.id as AnnotationToolType)
      : 'select';

    if (activeTool !== expectedToolId) {
      setActiveTool(expectedToolId);
    }
  }, [annotationState, annotationApi, activeTool, setActiveTool]);

  // Determine which tool should be highlighted
  // Pan tool takes precedence when active
  const getHighlightedTool = (toolId: AnnotationToolType) => {
    if (isPanning) {
      return false; // No annotation tool should be highlighted when pan is active
    }
    return activeTool === toolId;
  };

  const handleZoomIn = () => {
    if (zoomApi) {
      zoomApi.zoomIn();
      return;
    }

    // Fallback if zoom plugin is unavailable
    const newZoom = Math.min(400, zoom + 25);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (zoomApi) {
      zoomApi.zoomOut();
      return;
    }

    const newZoom = Math.max(25, zoom - 25);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    if (zoomApi) {
      zoomApi.requestZoom(ZoomMode.FitPage);
      return;
    }

    setZoom(100);
  };



  const tools: {
    id: AnnotationToolType;
    icon: React.ReactNode;
    label: string;
  }[] = [
      {
        id: 'select',
        icon: <MousePointer2 className="h-4 w-4" />,
        label: 'Select',
      },
      {
        id: 'highlight',
        icon: <Highlighter className="h-4 w-4" />,
        label: 'Highlight',
      },
      {
        id: 'underline',
        icon: <Underline className="h-4 w-4" />,
        label: 'Underline',
      },
      { id: 'freeText', icon: <Type className="h-4 w-4" />, label: 'Text' },
      { id: 'square', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
      { id: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
      {
        id: 'lineArrow',
        icon: <ArrowRight className="h-4 w-4" />,
        label: 'Arrow',
      },
    ];

  const handleToolSelect = (toolId: AnnotationToolType) => {
    setActiveTool(toolId);

    // If selecting select tool while pan is active, disable pan first
    if (toolId === 'select' && isPanning) {
      panApi?.disablePan();
    }

    if (toolId !== 'select') {
      annotationApi?.setActiveTool(toolId);
    } else {
      annotationApi?.setActiveTool(null);
    }

    if (isMobile) {
      closeSidebars?.();
    }
  };

  return (
    <div className="border-border bg-background flex h-14 items-center gap-1 border-b p-2">
      {/* Left sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className="h-8 w-8"
      >
        {leftSidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Pan tool */}
      <Button
        variant={isPanning ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => {
          panApi?.togglePan();
          if (isMobile) closeSidebars?.();
        }}
        className="h-8 w-8"
        title="Pan tool"
      >
        <Hand className="h-4 w-4" />
      </Button>

      {/* Annotation tools */}
      {showAnnotationTools ? (
        <div className="flex items-center gap-0.5">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center gap-0.5">
              <Button
                variant={getHighlightedTool(tool.id) ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => handleToolSelect(tool.id)}
                className="h-8 w-8"
                title={tool.label}
              >
                {tool.icon}
              </Button>
              {tool.id === 'select' && (
                <Separator orientation="vertical" className="mx-2 h-6" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <AnnotationToolsMenu
          documentId={documentId}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          isPanning={isPanning}
        />
      )}

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Annotation styles palette button */}
      <Button
        variant={
          leftSidebarOpen && leftSidebarTab === 'styles' ? 'secondary' : 'ghost'
        }
        size="icon"
        onClick={() => {
          if (!leftSidebarOpen) {
            setLeftSidebarOpen(true);
          }
          setLeftSidebarTab('styles');
        }}
        className="h-8 w-8"
        title="Annotation Styles"
      >
        <Palette className="h-4 w-4" />
      </Button>

      {showSearchBar && !isMobile && (
        <>
          <Separator
            orientation="vertical"
            className="mx-1 h-6"
          />

          {/* Search */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (rightSidebarOpen && rightSidebarTab === 'search') {
                      // If search sidebar is already open, go to next result
                      if (
                        searchApi &&
                        scrollApi &&
                        searchState.results.length > 0
                      ) {
                        // Calculate the next index
                        const currentIndex =
                          searchState.activeResultIndex >= 0
                            ? searchState.activeResultIndex
                            : -1;
                        const nextIndex =
                          currentIndex >= searchState.results.length - 1
                            ? 0
                            : currentIndex + 1;
                        const nextResult = searchState.results[nextIndex];

                        // Scroll to the next result
                        const minCoordinates = nextResult.rects.reduce(
                          (min, rect) => ({
                            x: Math.min(min.x, rect.origin.x),
                            y: Math.min(min.y, rect.origin.y),
                          }),
                          { x: Infinity, y: Infinity },
                        );

                        scrollApi.scrollToPage({
                          pageNumber: nextResult.pageIndex + 1,
                          pageCoordinates: minCoordinates,
                          alignX: 50,
                          alignY: 50,
                        });

                        // Update the active result
                        searchApi.goToResult(nextIndex);
                      }
                    } else {
                      // Open the search sidebar
                      setRightSidebarOpen(true);
                      setRightSidebarTab('search');
                    }
                  }
                }}
                className="h-8 w-32 pl-7 text-xs"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Zoom controls */}
      {showZoomControls ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {showResetZoom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetZoom}
              className="h-8 w-8"
              title="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}

      {showZoomControls && (
        <Separator orientation="vertical" className="mx-1 h-6" />
      )}

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setDarkMode(!darkMode)
          if (isMobile) closeSidebars?.();
        }}
        className="h-8 w-8"
        title={darkMode ? 'Light mode' : 'Dark mode (invert PDF)'}
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Comments sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setRightSidebarOpen(!rightSidebarOpen);
        }}
        className="h-8 w-8"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}
