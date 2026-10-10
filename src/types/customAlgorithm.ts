import { Process } from "./scheduling";

export interface AlgorithmBlock {
  id: string;
  type: "selection" | "condition" | "action";
  label: string;
  icon: string;
  category: "select" | "filter" | "sort" | "modify";
  operation: AlgorithmOperation;
  parameters?: AlgorithmParameter[];
}

export type AlgorithmOperation =
  | "shortest_burst"
  | "longest_burst"
  | "highest_priority"
  | "lowest_priority"
  | "earliest_arrival"
  | "latest_arrival"
  | "if_waiting_gt"
  | "if_waiting_lt"
  | "if_burst_gt"
  | "if_burst_lt"
  | "if_priority_gt"
  | "if_priority_lt"
  | "boost_priority"
  | "reduce_priority"
  | "custom_formula";

export interface AlgorithmParameter {
  name: string;
  type: "number" | "string" | "formula";
  value: any;
  label: string;
}

export interface BuiltAlgorithm {
  id: string;
  name: string;
  description: string;
  blocks: AlgorithmBlock[];
  connections: BlockConnection[];
}

export interface BlockConnection {
  fromBlockId: string;
  toBlockId: string;
  condition?: string;
}

export interface ProcessScore {
  process: Process;
  score: number;
  reason: string;
}
