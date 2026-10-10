import { SystemScheduleConfig } from "@/types/advancedScheduling";

export interface TreeNodePosition {
  id: string;
  type: "system" | "core" | "queue" | "info";
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  data?: any;
  children: TreeNodePosition[];
}

interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

const defaultLayoutConfig: LayoutConfig = {
  nodeWidth: 220,
  nodeHeight: 100,
  horizontalSpacing: 60,
  verticalSpacing: 120,
};

export function calculateTreeLayout(
  config: SystemScheduleConfig,
  layoutConfig: LayoutConfig = defaultLayoutConfig
): TreeNodePosition {
  const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = layoutConfig;

  // Build tree structure
  const systemNode: TreeNodePosition = {
    id: "system-root",
    type: "system",
    x: 0,
    y: 0,
    width: nodeWidth * 1.2,
    height: nodeHeight,
    level: 0,
    data: { name: "Multi-Core Scheduling System" },
    children: [],
  };

  // Add load balancing info node
  const infoNode: TreeNodePosition = {
    id: "load-balancing-info",
    type: "info",
    x: 0,
    y: 0,
    width: nodeWidth,
    height: nodeHeight * 0.7,
    level: 1,
    data: { 
      label: "Load Balancing",
      value: config.loadBalancing.replace(/_/g, " ").toUpperCase(),
    },
    children: [],
  };

  systemNode.children.push(infoNode);

  // Add core nodes
  config.cores.forEach((core, coreIndex) => {
    const coreNode: TreeNodePosition = {
      id: core.coreId,
      type: "core",
      x: 0,
      y: 0,
      width: nodeWidth,
      height: nodeHeight,
      level: 1,
      data: core,
      children: [],
    };

    // Add queue nodes under each core
    core.queues.forEach((queue, queueIndex) => {
      const queueNode: TreeNodePosition = {
        id: queue.queueId,
        type: "queue",
        x: 0,
        y: 0,
        width: nodeWidth * 0.9,
        height: nodeHeight * 0.8,
        level: 2,
        data: queue,
        children: [],
      };
      coreNode.children.push(queueNode);
    });

    systemNode.children.push(coreNode);
  });

  // Calculate positions using modified Reingold-Tilford algorithm
  assignInitialPositions(systemNode, layoutConfig);
  
  // Center the tree
  const bounds = calculateBounds(systemNode);
  const offsetX = -bounds.minX + 100;
  const offsetY = 50;
  offsetTree(systemNode, offsetX, offsetY);

  return systemNode;
}

function assignInitialPositions(
  node: TreeNodePosition,
  config: LayoutConfig,
  x: number = 0,
  y: number = 0
): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const { nodeWidth, horizontalSpacing, verticalSpacing } = config;

  // Calculate total width needed for children
  const totalChildrenWidth = node.children.reduce((sum, child, index) => {
    if (child.type === "info") return sum; // Info node doesn't affect width
    const childSubtreeWidth = calculateSubtreeWidth(child, config);
    return sum + childSubtreeWidth + (index > 0 ? horizontalSpacing : 0);
  }, 0);

  // Position children
  let currentX = x - totalChildrenWidth / 2;
  const nextY = y + node.height + verticalSpacing;

  node.children.forEach((child, index) => {
    if (child.type === "info") {
      // Info node positioned directly below system node
      assignInitialPositions(child, config, x, nextY - verticalSpacing / 2);
    } else {
      const childWidth = calculateSubtreeWidth(child, config);
      assignInitialPositions(child, config, currentX + childWidth / 2, nextY);
      currentX += childWidth + horizontalSpacing;
    }
  });
}

function calculateSubtreeWidth(node: TreeNodePosition, config: LayoutConfig): number {
  if (node.children.length === 0) {
    return node.width;
  }

  const childrenWidth = node.children.reduce((sum, child, index) => {
    const childWidth = calculateSubtreeWidth(child, config);
    return sum + childWidth + (index > 0 ? config.horizontalSpacing : 0);
  }, 0);

  return Math.max(node.width, childrenWidth);
}

function calculateBounds(node: TreeNodePosition): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = node.x;
  let maxX = node.x + node.width;
  let minY = node.y;
  let maxY = node.y + node.height;

  node.children.forEach((child) => {
    const childBounds = calculateBounds(child);
    minX = Math.min(minX, childBounds.minX);
    maxX = Math.max(maxX, childBounds.maxX);
    minY = Math.min(minY, childBounds.minY);
    maxY = Math.max(maxY, childBounds.maxY);
  });

  return { minX, maxX, minY, maxY };
}

function offsetTree(node: TreeNodePosition, offsetX: number, offsetY: number): void {
  node.x += offsetX;
  node.y += offsetY;
  node.children.forEach((child) => offsetTree(child, offsetX, offsetY));
}

export function flattenTree(node: TreeNodePosition): TreeNodePosition[] {
  const result: TreeNodePosition[] = [node];
  node.children.forEach((child) => {
    result.push(...flattenTree(child));
  });
  return result;
}

export function findNodeById(tree: TreeNodePosition, id: string): TreeNodePosition | null {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}
