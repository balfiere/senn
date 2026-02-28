import { Columns, FileText, LayoutGrid } from 'lucide-react';

import { Button } from '@/Components/ui/button';

interface SidebarViewStateProps {
    view: 'counters' | 'pdf' | 'split';
    onViewChange: (view: 'counters' | 'pdf' | 'split') => void;
    isMobile?: boolean;
}

export function SidebarViewState({
    view,
    onViewChange,
    isMobile,
}: SidebarViewStateProps) {
    return (
        <div
            className={
                isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-3 gap-1'
            }
        >
            <Button
                variant={view === 'counters' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-popover-foreground"
                onClick={() => onViewChange('counters')}
                title="Counters only"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={view === 'pdf' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-popover-foreground"
                onClick={() => onViewChange('pdf')}
                title="PDF only"
            >
                <FileText className="h-4 w-4" />
            </Button>
            {!isMobile && (
                <Button
                    variant={view === 'split' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-popover-foreground"
                    onClick={() => onViewChange('split')}
                    title="Split view"
                >
                    <Columns className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
