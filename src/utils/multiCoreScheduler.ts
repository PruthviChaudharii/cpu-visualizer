import { Process, ScheduleEvent, ProcessMetrics } from "@/types/scheduling";
import {
  SystemScheduleConfig,
  MultiCoreSimulationResult,
  CoreSimulationResult,
  ProcessMigration,
  QueueTransition,
  QueueStateSnapshot,
  AdvancedSystemMetrics,
} from "@/types/advancedScheduling";
import { calculateFCFS, calculateSJF, calculateSRTF, calculatePriority, calculateRoundRobin } from "./schedulingAlgorithms";
import { executeCustomAlgorithm } from "./customAlgorithmEngine";
import { assignProcessesToCores, shouldMigrateProcess } from "./loadBalancer";

export function simulateMultiCore(
  processes: Process[],
  config: SystemScheduleConfig
): MultiCoreSimulationResult {
  const processesWithColor = processes.map((p, i) => ({
    ...p,
    color: p.color || `hsl(${(i * 360) / processes.length}, 70%, 60%)`,
  }));

  if (config.cores.length === 1 && config.cores[0].queues.length === 1) {
    // Single core, single queue - use standard algorithms
    return simulateSingleCoreSystem(processesWithColor, config);
  }

  return simulateMultiCoreSystem(processesWithColor, config);
}

function simulateSingleCoreSystem(
  processes: Process[],
  config: SystemScheduleConfig
): MultiCoreSimulationResult {
  const queue = config.cores[0].queues[0];
  let result;

  switch (queue.algorithm) {
    case "FCFS":
      result = calculateFCFS(processes);
      break;
    case "SJF":
      result = calculateSJF(processes);
      break;
    case "SRTF":
      result = calculateSRTF(processes);
      break;
    case "Priority":
      result = calculatePriority(processes, false);
      break;
    case "RoundRobin":
      result = calculateRoundRobin(processes, queue.quantum || 2);
      break;
    case "Custom":
      if (queue.customAlgorithm) {
        result = simulateCustomAlgorithm(processes, queue.customAlgorithm, queue.quantum || 2);
      } else {
        result = calculateFCFS(processes);
      }
      break;
    default:
      result = calculateFCFS(processes);
  }

  const coreResult: CoreSimulationResult = {
    coreId: config.cores[0].coreId,
    ganttChart: result.ganttChart,
    metrics: result.metrics,
    utilization: result.systemMetrics.cpuUtilization,
    idleTime: 0,
    completedProcessCount: processes.length,
    queueStates: [],
  };

  return {
    coreResults: [coreResult],
    systemMetrics: {
      ...result.systemMetrics,
      loadVariance: 0,
      migrationOverhead: 0,
      loadBalancingEfficiency: 100,
      perCoreUtilization: [result.systemMetrics.cpuUtilization],
      queueMetrics: [],
    },
    migrations: [],
    queueTransitions: [],
    timeline: [],
  };
}

function simulateMultiCoreSystem(
  processes: Process[],
  config: SystemScheduleConfig
): MultiCoreSimulationResult {
  const coreResults: CoreSimulationResult[] = [];
  const migrations: ProcessMigration[] = [];
  const queueTransitions: QueueTransition[] = [];

  // Assign processes to cores initially
  const coreAssignments = assignProcessesToCores(processes, config);

  // Simulate each core
  config.cores.forEach((coreConfig, index) => {
    const coreProcesses = coreAssignments[coreConfig.coreId] || [];
    
    if (coreProcesses.length === 0) {
      // Empty core
      coreResults.push({
        coreId: coreConfig.coreId,
        ganttChart: [],
        metrics: [],
        utilization: 0,
        idleTime: 0,
        completedProcessCount: 0,
        queueStates: [],
      });
      return;
    }

    // For now, simulate each core's first queue only (simplified)
    const primaryQueue = coreConfig.queues[0];
    let result;

    switch (primaryQueue.algorithm) {
      case "FCFS":
        result = calculateFCFS(coreProcesses);
        break;
      case "SJF":
        result = calculateSJF(coreProcesses);
        break;
      case "SRTF":
        result = calculateSRTF(coreProcesses);
        break;
      case "Priority":
        result = calculatePriority(coreProcesses, false);
        break;
      case "RoundRobin":
        result = calculateRoundRobin(coreProcesses, primaryQueue.quantum || 2);
        break;
      default:
        result = calculateFCFS(coreProcesses);
    }

    coreResults.push({
      coreId: coreConfig.coreId,
      ganttChart: result.ganttChart,
      metrics: result.metrics,
      utilization: result.systemMetrics.cpuUtilization,
      idleTime: 0,
      completedProcessCount: coreProcesses.length,
      queueStates: [],
    });
  });

  // Calculate system metrics
  const avgWaitingTime =
    coreResults.reduce((sum, cr) => {
      const coreAvg = cr.metrics.reduce((s, m) => s + m.waitingTime, 0) / (cr.metrics.length || 1);
      return sum + coreAvg;
    }, 0) / coreResults.length;

  const avgTurnaroundTime =
    coreResults.reduce((sum, cr) => {
      const coreAvg = cr.metrics.reduce((s, m) => s + m.turnaroundTime, 0) / (cr.metrics.length || 1);
      return sum + coreAvg;
    }, 0) / coreResults.length;

  const perCoreUtilization = coreResults.map((cr) => cr.utilization);
  const avgUtilization = perCoreUtilization.reduce((a, b) => a + b, 0) / perCoreUtilization.length;

  const loadVariance =
    perCoreUtilization.reduce((sum, util) => sum + Math.pow(util - avgUtilization, 2), 0) /
    perCoreUtilization.length;

  const systemMetrics: AdvancedSystemMetrics = {
    averageWaitingTime: avgWaitingTime,
    averageTurnaroundTime: avgTurnaroundTime,
    cpuUtilization: avgUtilization,
    throughput: processes.length / (Math.max(...coreResults.flatMap((cr) => cr.ganttChart.map((e) => e.endTime))) || 1),
    contextSwitches: coreResults.reduce((sum, cr) => {
      return sum + Math.max(0, cr.ganttChart.length - 1);
    }, 0),
    loadVariance,
    migrationOverhead: migrations.length * 0.1,
    loadBalancingEfficiency: Math.max(0, 100 - loadVariance * 10),
    perCoreUtilization,
    queueMetrics: [],
  };

  return {
    coreResults,
    systemMetrics,
    migrations,
    queueTransitions,
    timeline: [],
  };
}

function simulateCustomAlgorithm(processes: Process[], algorithm: any, quantum: number) {
  // Simplified custom algorithm simulation
  return calculateRoundRobin(processes, quantum);
}
