export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  color: string;
}

export interface ScheduleEvent {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface ProcessMetrics {
  processId: string;
  processName: string;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
  completionTime: number;
}

export interface SystemMetrics {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number;
  contextSwitches: number;
}

export interface ProcessStateBlock {
  processId: string;
  state: "NEW" | "READY" | "RUNNING" | "TERMINATED";
  startTime: number;
  endTime: number;
  color: string;
}

export interface ProcessTimeline {
  processId: string;
  processName: string;
  color: string;
  stateBlocks: ProcessStateBlock[];
}

export interface ContextSwitch {
  time: number;
  fromProcessId: string;
  toProcessId: string;
  fromProcessName: string;
  toProcessName: string;
  switchNumber: number;
}

export interface ResourceMetrics {
  time: number;
  cpuUtilization: number;
  readyQueueLength: number;
  memoryUsage: number;
  completedProcesses: number;
}

export type AlgorithmType = 
  | "FCFS" 
  | "SJF" 
  | "SRTF" 
  | "Priority" 
  | "Priority-Preemptive" 
  | "RoundRobin";

export interface SimulationState {
  currentTime: number;
  isRunning: boolean;
  speed: number;
  ganttChart: ScheduleEvent[];
  readyQueue: Process[];
  runningProcess: Process | null;
  completedProcesses: string[];
  processMetrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
}
