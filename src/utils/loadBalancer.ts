import { Process } from "@/types/scheduling";
import { SystemScheduleConfig } from "@/types/advancedScheduling";

export function assignProcessesToCores(
  processes: Process[],
  config: SystemScheduleConfig
): Record<string, Process[]> {
  const assignments: Record<string, Process[]> = {};
  
  config.cores.forEach((core) => {
    assignments[core.coreId] = [];
  });

  switch (config.loadBalancing) {
    case "round_robin":
      processes.forEach((process, index) => {
        const coreIndex = index % config.cores.length;
        const coreId = config.cores[coreIndex].coreId;
        assignments[coreId].push(process);
      });
      break;

    case "least_loaded":
      processes.forEach((process) => {
        // Find core with least processes
        const leastLoadedCore = config.cores.reduce((min, core) => {
          return assignments[core.coreId].length < assignments[min.coreId].length ? core : min;
        }, config.cores[0]);
        assignments[leastLoadedCore.coreId].push(process);
      });
      break;

    case "random":
      processes.forEach((process) => {
        const randomCore = config.cores[Math.floor(Math.random() * config.cores.length)];
        assignments[randomCore.coreId].push(process);
      });
      break;

    case "static_assignment":
    default:
      // Assign all to first core
      assignments[config.cores[0].coreId] = [...processes];
      break;
  }

  return assignments;
}

export function shouldMigrateProcess(
  fromCoreLoad: number,
  toCoreLoad: number,
  threshold: number = 0.3
): boolean {
  return Math.abs(fromCoreLoad - toCoreLoad) > threshold;
}

export function calculateCoreLoad(processCount: number, maxProcesses: number): number {
  return maxProcesses > 0 ? processCount / maxProcesses : 0;
}
