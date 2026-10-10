import { AlgorithmType } from "@/types/scheduling";

export interface NarrationScript {
  text: string;
  duration?: number;
}

export const generateAlgorithmIntro = (algorithm: AlgorithmType, quantum?: number): string => {
  const intros: Record<AlgorithmType, string> = {
    FCFS: "First Come First Served algorithm selected. Processes will execute in the exact order they arrive. This is the simplest scheduling algorithm, operating like a queue where the first process to arrive gets CPU time first.",
    SJF: "Shortest Job First algorithm selected. The process with the smallest burst time will be executed first. This algorithm minimizes average waiting time but may cause starvation for longer processes.",
    SRTF: "Shortest Remaining Time First algorithm selected. This is the preemptive version of SJF. The process with the smallest remaining burst time gets priority, allowing for context switches when shorter jobs arrive.",
    RoundRobin: `Round Robin algorithm selected with time quantum of ${quantum || 2} milliseconds. Each process gets equal CPU time in a circular fashion. This ensures fairness and prevents starvation.`,
    Priority: "Priority Scheduling algorithm selected. Processes are executed based on their priority level. Lower priority numbers indicate higher priority. This can lead to starvation of low-priority processes.",
    "Priority-Preemptive": "Preemptive Priority Scheduling algorithm selected. Higher priority processes can interrupt currently running lower priority processes. This ensures critical tasks get immediate attention.",
  };

  return intros[algorithm] || "Unknown algorithm selected.";
};

export const generateProcessStateNarration = (
  processId: string,
  state: "new" | "ready" | "running" | "terminated",
  time: number
): string => {
  const narrations = {
    new: `Process ${processId} has entered the system at time ${time.toFixed(1)}.`,
    ready: `Process ${processId} is now ready and waiting in the queue at time ${time.toFixed(1)}.`,
    running: `Process ${processId} is now running on the CPU at time ${time.toFixed(1)}.`,
    terminated: `Process ${processId} has completed execution at time ${time.toFixed(1)}.`,
  };

  return narrations[state];
};

export const generateContextSwitchNarration = (
  fromProcess: string | null,
  toProcess: string,
  time: number,
  switchNumber: number
): string => {
  if (!fromProcess) {
    return `Context switch number ${switchNumber}: CPU is now executing Process ${toProcess} at time ${time.toFixed(1)}.`;
  }
  return `Context switch number ${switchNumber}: Switching from Process ${fromProcess} to Process ${toProcess} at time ${time.toFixed(1)}.`;
};

export const generateMetricsNarration = (metrics: {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
}): string => {
  return `Simulation complete. Performance metrics: Average waiting time is ${metrics.avgWaitingTime.toFixed(2)} milliseconds. Average turnaround time is ${metrics.avgTurnaroundTime.toFixed(2)} milliseconds. CPU utilization is ${metrics.cpuUtilization.toFixed(1)} percent. Throughput is ${metrics.throughput.toFixed(2)} processes per millisecond.`;
};

export const generateSimulationStartNarration = (processCount: number): string => {
  return `Starting simulation with ${processCount} process${processCount !== 1 ? "es" : ""}. Initializing scheduler.`;
};

export const generateSimulationCompleteNarration = (totalTime: number, processCount: number): string => {
  return `All ${processCount} processes have completed execution. Total simulation time was ${totalTime.toFixed(1)} milliseconds.`;
};

export const generateQueueUpdateNarration = (queueLength: number): string => {
  if (queueLength === 0) {
    return "Ready queue is now empty.";
  }
  return `Ready queue now contains ${queueLength} process${queueLength !== 1 ? "es" : ""} waiting for CPU time.`;
};
