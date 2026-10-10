import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, ListOrdered, Network, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { TreeNodePosition } from "@/utils/treeLayoutCalculator";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
  node: TreeNodePosition;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
  onClick: () => void;
}

export function TreeNode({ node, isExpanded, isHighlighted, onToggle, onClick }: TreeNodeProps) {
  const getIcon = () => {
    switch (node.type) {
      case "system":
        return <Network className="w-5 h-5" />;
      case "core":
        return <Cpu className="w-5 h-5" />;
      case "queue":
        return <ListOrdered className="w-4 h-4" />;
      case "info":
        return <Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (node.type) {
      case "system":
        return node.data.name;
      case "core":
        return node.data.name;
      case "queue":
        return node.data.name;
      case "info":
        return node.data.label;
      default:
        return "";
    }
  };

  const getBorderColor = () => {
    if (node.type === "core" || node.type === "queue") {
      return node.data.color || "hsl(var(--primary))";
    }
    return "hsl(var(--border))";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.width,
      }}
    >
      <Card
        className={cn(
          "glass-panel p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
          isHighlighted && "ring-2 ring-primary shadow-lg scale-105",
          node.type === "system" && "bg-primary/10",
          node.type === "info" && "bg-muted/30"
        )}
        style={{
          borderLeft: `4px solid ${getBorderColor()}`,
          minHeight: node.height,
        }}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="mt-1 p-2 rounded-lg bg-background/50"
              style={{
                color: node.type === "core" || node.type === "queue" ? node.data.color : "hsl(var(--primary))",
              }}
            >
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2">
              <h4
                className={cn(
                  "font-semibold leading-tight",
                  node.type === "system" && "text-lg",
                  node.type === "core" && "text-base",
                  node.type === "queue" && "text-sm",
                  node.type === "info" && "text-sm"
                )}
              >
                {getTitle()}
              </h4>

              {node.type === "queue" && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {node.data.algorithm}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority: {node.data.priority}
                  </Badge>
                  {node.data.quantum && (
                    <Badge variant="outline" className="text-xs">
                      Quantum: {node.data.quantum}
                    </Badge>
                  )}
                </div>
              )}

              {node.type === "core" && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {node.data.queues.length} Queue{node.data.queues.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}

              {node.type === "info" && (
                <p className="text-sm text-muted-foreground">{node.data.value}</p>
              )}
            </div>
          </div>

          {node.children.length > 0 && node.type !== "info" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 hover:bg-background/50 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
