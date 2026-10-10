import { motion } from "framer-motion";
import { TreeNodePosition } from "@/utils/treeLayoutCalculator";

interface TreeConnectionLinesProps {
  parentNode: TreeNodePosition;
  childNode: TreeNodePosition;
  isVisible: boolean;
}

export function TreeConnectionLines({ parentNode, childNode, isVisible }: TreeConnectionLinesProps) {
  if (!isVisible) return null;

  const startX = parentNode.x + parentNode.width / 2;
  const startY = parentNode.y + parentNode.height;
  const endX = childNode.x + childNode.width / 2;
  const endY = childNode.y;

  // Control point for smooth Bezier curve
  const controlY = (startY + endY) / 2;

  const path = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

  // Get color from core or use default
  const strokeColor = childNode.type === "core" || childNode.type === "queue" 
    ? childNode.data?.color || "hsl(var(--primary))"
    : "hsl(var(--border))";

  return (
    <motion.path
      d={path}
      stroke={strokeColor}
      strokeWidth={2}
      fill="none"
      opacity={0.6}
      strokeDasharray={childNode.type === "info" ? "5,5" : "0"}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  );
}

interface TreeConnectionsProps {
  tree: TreeNodePosition;
  expandedNodes: Set<string>;
}

export function TreeConnections({ tree, expandedNodes }: TreeConnectionsProps) {
  const renderConnections = (node: TreeNodePosition): JSX.Element[] => {
    const lines: JSX.Element[] = [];

    if (expandedNodes.has(node.id) || node.type === "system") {
      node.children.forEach((child) => {
        lines.push(
          <TreeConnectionLines
            key={`${node.id}-${child.id}`}
            parentNode={node}
            childNode={child}
            isVisible={true}
          />
        );
        lines.push(...renderConnections(child));
      });
    }

    return lines;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {renderConnections(tree)}
    </svg>
  );
}
