import { useState, useRef, useEffect } from "react";
import { SystemScheduleConfig } from "@/types/advancedScheduling";
import { Card } from "@/components/ui/card";
import { TreeNode } from "./TreeNode";
import { TreeConnections } from "./TreeConnectionLines";
import { TreeControls } from "./TreeControls";
import { calculateTreeLayout, flattenTree, TreeNodePosition } from "@/utils/treeLayoutCalculator";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface SystemConfigTreeViewProps {
  config: SystemScheduleConfig;
  onNodeClick?: (nodeType: "core" | "queue", id: string) => void;
  highlightedNodeId?: string | null;
}

export function SystemConfigTreeView({
  config,
  onNodeClick,
  highlightedNodeId,
}: SystemConfigTreeViewProps) {
  const [tree, setTree] = useState<TreeNodePosition | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["system-root"]));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [matchingNodeIds, setMatchingNodeIds] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Calculate tree layout
  useEffect(() => {
    const treeLayout = calculateTreeLayout(config);
    setTree(treeLayout);
    
    // Auto-expand all nodes initially
    const allNodeIds = flattenTree(treeLayout).map(node => node.id);
    setExpandedNodes(new Set(allNodeIds));
  }, [config]);

  // Search functionality
  useEffect(() => {
    if (!tree || !searchQuery) {
      setMatchingNodeIds(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const allNodes = flattenTree(tree);
    const matches = allNodes.filter((node) => {
      const name = node.type === "system" 
        ? node.data.name 
        : node.type === "info"
        ? node.data.label
        : node.data?.name || "";
      return name.toLowerCase().includes(query);
    });

    const matchIds = new Set(matches.map((n) => n.id));
    setMatchingNodeIds(matchIds);

    // Auto-expand paths to matching nodes
    matches.forEach((match) => {
      let current: TreeNodePosition | null = match;
      while (current) {
        expandedNodes.add(current.id);
        current = findParent(tree, current.id);
      }
    });
    setExpandedNodes(new Set(expandedNodes));
  }, [searchQuery, tree]);

  const findParent = (root: TreeNodePosition, childId: string): TreeNodePosition | null => {
    for (const child of root.children) {
      if (child.id === childId) return root;
      const found = findParent(child, childId);
      if (found) return found;
    }
    return null;
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleExpandAll = () => {
    if (!tree) return;
    const allNodeIds = flattenTree(tree).map(node => node.id);
    setExpandedNodes(new Set(allNodeIds));
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set(["system-root"]));
  };

  const handleExport = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `scheduler-tree-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Tree exported as PNG!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export tree");
    }
  };

  // Pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const renderNodes = (node: TreeNodePosition, parentExpanded: boolean = true): JSX.Element[] => {
    if (!parentExpanded) return [];

    const nodes: JSX.Element[] = [];
    const isExpanded = expandedNodes.has(node.id) || node.type === "system";
    const isHighlighted = 
      matchingNodeIds.has(node.id) || 
      highlightedNodeId === node.id;

    nodes.push(
      <TreeNode
        key={node.id}
        node={node}
        isExpanded={isExpanded}
        isHighlighted={isHighlighted}
        onToggle={() => toggleNode(node.id)}
        onClick={() => {
          if (node.type === "core" || node.type === "queue") {
            onNodeClick?.(node.type, node.id);
          }
        }}
      />
    );

    if (isExpanded) {
      node.children.forEach((child) => {
        nodes.push(...renderNodes(child, isExpanded));
      });
    }

    return nodes;
  };

  if (!tree) {
    return (
      <Card className="glass-panel p-8 text-center">
        <p className="text-muted-foreground">Loading tree visualization...</p>
      </Card>
    );
  }

  const allNodes = flattenTree(tree);
  const bounds = allNodes.reduce(
    (acc, node) => ({
      maxX: Math.max(acc.maxX, node.x + node.width),
      maxY: Math.max(acc.maxY, node.y + node.height),
    }),
    { maxX: 0, maxY: 0 }
  );

  return (
    <div className="space-y-4">
      <TreeControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      <Card className="glass-panel overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full h-[600px] overflow-auto bg-background/30 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={contentRef}
            className="relative origin-top-left transition-transform duration-200"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: bounds.maxX + 200,
              height: bounds.maxY + 100,
              minWidth: "100%",
              minHeight: "100%",
            }}
          >
            <TreeConnections tree={tree} expandedNodes={expandedNodes} />
            {renderNodes(tree, true)}
          </div>
        </div>
      </Card>

      {searchQuery && matchingNodeIds.size > 0 && (
        <Card className="glass-panel p-4">
          <p className="text-sm text-muted-foreground">
            Found {matchingNodeIds.size} matching node{matchingNodeIds.size !== 1 ? "s" : ""}
          </p>
        </Card>
      )}
    </div>
  );
}
