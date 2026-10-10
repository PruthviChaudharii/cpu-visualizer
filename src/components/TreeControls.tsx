import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download, 
  Search,
  Expand,
  Minimize
} from "lucide-react";

interface TreeControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function TreeControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: TreeControlsProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Expand/Collapse */}
        <div className="flex items-center gap-2">
          <Button onClick={onExpandAll} size="sm" variant="outline">
            <Expand className="w-4 h-4 mr-2" />
            Expand All
          </Button>
          <Button onClick={onCollapseAll} size="sm" variant="outline">
            <Minimize className="w-4 h-4 mr-2" />
            Collapse All
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button onClick={onZoomOut} size="sm" variant="outline" disabled={zoom <= 0.5}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button onClick={onZoomIn} size="sm" variant="outline" disabled={zoom >= 2}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={onResetView} size="sm" variant="outline">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Export */}
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </Button>
      </div>
    </Card>
  );
}
