import { Process, ProcessMetrics, SystemMetrics, ScheduleEvent } from "./scheduling";

export interface CoreConfig {
  coreId: string;
  name: string;
  queues: QueueConfig[];
  color: string;
}

export interface QueueConfig {
  queueId: string;
  name: string;
  priority: number;
  algorithm: "FCFS" | "SJF" | "SRTF" | "Priority" | "RoundRobin" | "Custom";
  customAlgorithm?: CustomAlgorithm;
  quantum?: number;
  promotionRule?: MigrationRule;
  demotionRule?: MigrationRule;
}

export interface MigrationRule {
  enabled: boolean;
  condition: "waiting_time" | "quantum_expired" | "burst_completed" | "priority_change" | "custom";
  threshold?: number;
  targetQueueId?: string;
  customCondition?: string; // formula like "waitingTime > 10 && burstTime < 5"
}

export interface CustomAlgorithm {
  id: string;
  name: string;
  description: string;
  selectionLogic: SelectionLogic;
  preemptionRule?: PreemptionRule;
}

export interface SelectionLogic {
  type: "formula" | "blocks";
  formula?: string; // e.g., "(burstTime * 0.6) + (priority * 0.4)"
  blocks?: LogicBlock[];
}

export interface LogicBlock {
  id: string;
  type: "condition" | "selection" | "action";
  operation: string; // "shortest_burst", "highest_priority", "if_waiting_time_gt", etc.
  value?: number;
  children?: LogicBlock[];
}

export interface PreemptionRule {
  enabled: boolean;
  condition: "time_quantum" | "higher_priority_arrival" | "custom";
  quantum?: number;
  customCondition?: string;
}

export interface SystemScheduleConfig {
  cores: CoreConfig[];
  loadBalancing: "round_robin" | "least_loaded" | "random" | "static_assignment";
  migrationPolicy: {
    enabled: boolean;
    type?: "work_stealing" | "periodic_balancing";
    interval?: number;
  };
}

export interface CoreSimulationResult {
  coreId: string;
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  utilization: number;
  idleTime: number;
  completedProcessCount: number;
  queueStates: QueueStateSnapshot[];
}

export interface QueueStateSnapshot {
  time: number;
  queueId: string;
  processIds: string[];
  length: number;
}

export interface MultiCoreSimulationResult {
  coreResults: CoreSimulationResult[];
  systemMetrics: AdvancedSystemMetrics;
  migrations: ProcessMigration[];
  queueTransitions: QueueTransition[];
  timeline: TimelineEvent[];
}

export interface AdvancedSystemMetrics extends SystemMetrics {
  loadVariance: number;
  migrationOverhead: number;
  loadBalancingEfficiency: number;
  perCoreUtilization: number[];
  queueMetrics: QueueMetrics[];
}

export interface QueueMetrics {
  queueId: string;
  queueName: string;
  averageResidenceTime: number;
  promotionCount: number;
  demotionCount: number;
  starvationDetected: boolean;
}

export interface ProcessMigration {
  time: number;
  processId: string;
  fromCoreId: string;
  toCoreId: string;
  reason: string;
}

export interface QueueTransition {
  time: number;
  processId: string;
  fromQueueId: string;
  toQueueId: string;
  reason: "promotion" | "demotion" | "arrival";
}

export interface TimelineEvent {
  time: number;
  type: "process_start" | "process_complete" | "migration" | "queue_transition" | "context_switch";
  details: any;
}
