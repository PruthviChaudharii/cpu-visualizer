import { Process, ScheduleEvent, ProcessMetrics, SystemMetrics } from "@/types/scheduling";

const PROCESS_COLORS = [
  "hsl(180 100% 50%)", // Cyan
  "hsl(150 100% 45%)", // Green
  "hsl(280 80% 60%)",  // Purple
  "hsl(40 100% 55%)",  // Orange
  "hsl(200 100% 55%)", // Blue
  "hsl(320 80% 60%)",  // Pink
];

export function assignColors(processes: Process[]): Process[] {
  return processes.map((process, index) => ({
    ...process,
    color: PROCESS_COLORS[index % PROCESS_COLORS.length],
  }));
}

export function calculateFCFS(processes: Process[]): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const ganttChart: ScheduleEvent[] = [];
  const metrics: ProcessMetrics[] = [];
  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let contextSwitches = 0;

  sortedProcesses.forEach((process) => {
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }

    const startTime = currentTime;
    const endTime = currentTime + process.burstTime;
    const waitingTime = startTime - process.arrivalTime;
    const turnaroundTime = endTime - process.arrivalTime;

    ganttChart.push({
      processId: process.id,
      processName: process.name,
      startTime,
      endTime,
      color: process.color,
    });

    metrics.push({
      processId: process.id,
      processName: process.name,
      waitingTime,
      turnaroundTime,
      responseTime: waitingTime,
      completionTime: endTime,
    });

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;
    contextSwitches++;
  });

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: contextSwitches - 1,
  };

  return { ganttChart, metrics, systemMetrics };
}

export function calculateSJF(processes: Process[]): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const ganttChart: ScheduleEvent[] = [];
  const metrics: ProcessMetrics[] = [];
  const remaining = [...processes];
  let currentTime = 0;
  let completed = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let contextSwitches = 0;

  while (completed < processes.length) {
    const available = remaining.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      currentTime++;
      continue;
    }

    const shortest = available.reduce((min, p) =>
      p.burstTime < min.burstTime ? p : min
    );

    const startTime = currentTime;
    const endTime = currentTime + shortest.burstTime;
    const waitingTime = startTime - shortest.arrivalTime;
    const turnaroundTime = endTime - shortest.arrivalTime;

    ganttChart.push({
      processId: shortest.id,
      processName: shortest.name,
      startTime,
      endTime,
      color: shortest.color,
    });

    metrics.push({
      processId: shortest.id,
      processName: shortest.name,
      waitingTime,
      turnaroundTime,
      responseTime: waitingTime,
      completionTime: endTime,
    });

    shortest.remainingTime = 0;
    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;
    completed++;
    contextSwitches++;
  }

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: contextSwitches - 1,
  };

  return { ganttChart, metrics, systemMetrics };
}

export function calculateSRTF(processes: Process[]): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const ganttChart: ScheduleEvent[] = [];
  const remaining = processes.map((p) => ({ ...p }));
  const completionTimes: Map<string, number> = new Map();
  const responseTimes: Map<string, number> = new Map();
  let currentTime = 0;
  let contextSwitches = 0;
  let lastProcess: Process | null = null;

  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + 
                  processes.reduce((sum, p) => sum + p.burstTime, 0);

  while (currentTime < maxTime && remaining.some((p) => p.remainingTime > 0)) {
    const available = remaining.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      currentTime++;
      continue;
    }

    const shortest = available.reduce((min, p) =>
      p.remainingTime < min.remainingTime ? p : min
    );

    if (!responseTimes.has(shortest.id)) {
      responseTimes.set(shortest.id, currentTime - shortest.arrivalTime);
    }

    if (lastProcess !== shortest) {
      contextSwitches++;
      lastProcess = shortest;
    }

    const startTime = currentTime;
    shortest.remainingTime--;
    currentTime++;

    if (shortest.remainingTime === 0) {
      completionTimes.set(shortest.id, currentTime);
    }

    if (ganttChart.length > 0 && 
        ganttChart[ganttChart.length - 1].processId === shortest.id &&
        ganttChart[ganttChart.length - 1].endTime === startTime) {
      ganttChart[ganttChart.length - 1].endTime = currentTime;
    } else {
      ganttChart.push({
        processId: shortest.id,
        processName: shortest.name,
        startTime,
        endTime: currentTime,
        color: shortest.color,
      });
    }
  }

  const metrics: ProcessMetrics[] = processes.map((process) => {
    const completionTime = completionTimes.get(process.id) || 0;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = responseTimes.get(process.id) || 0;

    return {
      processId: process.id,
      processName: process.name,
      waitingTime,
      turnaroundTime,
      responseTime,
      completionTime,
    };
  });

  const totalWaitingTime = metrics.reduce((sum, m) => sum + m.waitingTime, 0);
  const totalTurnaroundTime = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0);

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: Math.max(0, contextSwitches - 1),
  };

  return { ganttChart, metrics, systemMetrics };
}

export function calculateRoundRobin(
  processes: Process[],
  quantum: number = 2
): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const ganttChart: ScheduleEvent[] = [];
  const remaining = processes.map((p) => ({ ...p }));
  const readyQueue: Process[] = [];
  const completionTimes: Map<string, number> = new Map();
  const responseTimes: Map<string, number> = new Map();
  let currentTime = 0;
  let contextSwitches = 0;

  const arrivals = [...remaining].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let arrivalIndex = 0;

  while (remaining.some((p) => p.remainingTime > 0) || readyQueue.length > 0) {
    while (arrivalIndex < arrivals.length && arrivals[arrivalIndex].arrivalTime <= currentTime) {
      const process = remaining.find((p) => p.id === arrivals[arrivalIndex].id);
      if (process && process.remainingTime > 0 && !readyQueue.includes(process)) {
        readyQueue.push(process);
      }
      arrivalIndex++;
    }

    if (readyQueue.length === 0) {
      currentTime++;
      continue;
    }

    const process = readyQueue.shift()!;
    const executeTime = Math.min(quantum, process.remainingTime);
    
    if (!responseTimes.has(process.id)) {
      responseTimes.set(process.id, currentTime - process.arrivalTime);
    }

    ganttChart.push({
      processId: process.id,
      processName: process.name,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      color: process.color,
    });

    currentTime += executeTime;
    process.remainingTime -= executeTime;

    while (arrivalIndex < arrivals.length && arrivals[arrivalIndex].arrivalTime <= currentTime) {
      const newProcess = remaining.find((p) => p.id === arrivals[arrivalIndex].id);
      if (newProcess && newProcess.remainingTime > 0 && !readyQueue.includes(newProcess) && newProcess.id !== process.id) {
        readyQueue.push(newProcess);
      }
      arrivalIndex++;
    }

    if (process.remainingTime > 0) {
      readyQueue.push(process);
    } else {
      completionTimes.set(process.id, currentTime);
    }
    
    contextSwitches++;
  }

  const metrics: ProcessMetrics[] = processes.map((process) => {
    const completionTime = completionTimes.get(process.id) || 0;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = responseTimes.get(process.id) || 0;

    return {
      processId: process.id,
      processName: process.name,
      waitingTime,
      turnaroundTime,
      responseTime,
      completionTime,
    };
  });

  const totalWaitingTime = metrics.reduce((sum, m) => sum + m.waitingTime, 0);
  const totalTurnaroundTime = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0);

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: contextSwitches - 1,
  };

  return { ganttChart, metrics, systemMetrics };
}

export function calculatePriority(processes: Process[], preemptive: boolean = false): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  if (!preemptive) {
    return calculatePriorityNonPreemptive(processes);
  }
  return calculatePriorityPreemptive(processes);
}

function calculatePriorityNonPreemptive(processes: Process[]): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const ganttChart: ScheduleEvent[] = [];
  const metrics: ProcessMetrics[] = [];
  const remaining = [...processes];
  let currentTime = 0;
  let completed = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let contextSwitches = 0;

  while (completed < processes.length) {
    const available = remaining.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      currentTime++;
      continue;
    }

    const highest = available.reduce((min, p) =>
      p.priority < min.priority ? p : min
    );

    const startTime = currentTime;
    const endTime = currentTime + highest.burstTime;
    const waitingTime = startTime - highest.arrivalTime;
    const turnaroundTime = endTime - highest.arrivalTime;

    ganttChart.push({
      processId: highest.id,
      processName: highest.name,
      startTime,
      endTime,
      color: highest.color,
    });

    metrics.push({
      processId: highest.id,
      processName: highest.name,
      waitingTime,
      turnaroundTime,
      responseTime: waitingTime,
      completionTime: endTime,
    });

    highest.remainingTime = 0;
    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
    currentTime = endTime;
    completed++;
    contextSwitches++;
  }

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: contextSwitches - 1,
  };

  return { ganttChart, metrics, systemMetrics };
}

function calculatePriorityPreemptive(processes: Process[]): {
  ganttChart: ScheduleEvent[];
  metrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
} {
  const ganttChart: ScheduleEvent[] = [];
  const remaining = processes.map((p) => ({ ...p }));
  const completionTimes: Map<string, number> = new Map();
  const responseTimes: Map<string, number> = new Map();
  let currentTime = 0;
  let contextSwitches = 0;
  let lastProcess: Process | null = null;

  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + 
                  processes.reduce((sum, p) => sum + p.burstTime, 0);

  while (currentTime < maxTime && remaining.some((p) => p.remainingTime > 0)) {
    const available = remaining.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      currentTime++;
      continue;
    }

    const highest = available.reduce((min, p) =>
      p.priority < min.priority ? p : min
    );

    if (!responseTimes.has(highest.id)) {
      responseTimes.set(highest.id, currentTime - highest.arrivalTime);
    }

    if (lastProcess !== highest) {
      contextSwitches++;
      lastProcess = highest;
    }

    const startTime = currentTime;
    highest.remainingTime--;
    currentTime++;

    if (highest.remainingTime === 0) {
      completionTimes.set(highest.id, currentTime);
    }

    if (ganttChart.length > 0 && 
        ganttChart[ganttChart.length - 1].processId === highest.id &&
        ganttChart[ganttChart.length - 1].endTime === startTime) {
      ganttChart[ganttChart.length - 1].endTime = currentTime;
    } else {
      ganttChart.push({
        processId: highest.id,
        processName: highest.name,
        startTime,
        endTime: currentTime,
        color: highest.color,
      });
    }
  }

  const metrics: ProcessMetrics[] = processes.map((process) => {
    const completionTime = completionTimes.get(process.id) || 0;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = responseTimes.get(process.id) || 0;

    return {
      processId: process.id,
      processName: process.name,
      waitingTime,
      turnaroundTime,
      responseTime,
      completionTime,
    };
  });

  const totalWaitingTime = metrics.reduce((sum, m) => sum + m.waitingTime, 0);
  const totalTurnaroundTime = metrics.reduce((sum, m) => sum + m.turnaroundTime, 0);

  const systemMetrics: SystemMetrics = {
    averageWaitingTime: totalWaitingTime / processes.length,
    averageTurnaroundTime: totalTurnaroundTime / processes.length,
    cpuUtilization: (processes.reduce((sum, p) => sum + p.burstTime, 0) / currentTime) * 100,
    throughput: processes.length / currentTime,
    contextSwitches: Math.max(0, contextSwitches - 1),
  };

  return { ganttChart, metrics, systemMetrics };
}

// Advanced Visualization Utilities
import { ProcessTimeline, ProcessStateBlock, ContextSwitch, ResourceMetrics } from "@/types/scheduling";

export function generateProcessTimelines(
  processes: Process[],
  ganttChart: ScheduleEvent[],
  metrics: ProcessMetrics[]
): ProcessTimeline[] {
  return processes.map((process) => {
    const stateBlocks: ProcessStateBlock[] = [];
    const processEvents = ganttChart.filter((e) => e.processId === process.id);
    const metric = metrics.find((m) => m.processId === process.id);
    
    if (!metric) return { processId: process.id, processName: process.name, color: process.color, stateBlocks: [] };

    // NEW state (from 0 to arrival time)
    if (process.arrivalTime > 0) {
      stateBlocks.push({
        processId: process.id,
        state: "NEW",
        startTime: 0,
        endTime: process.arrivalTime,
        color: "hsl(200 100% 55%)", // Blue
      });
    }

    // Track all time periods
    let currentTime = process.arrivalTime;
    
    processEvents.forEach((event, index) => {
      // READY state (waiting before execution)
      if (event.startTime > currentTime) {
        stateBlocks.push({
          processId: process.id,
          state: "READY",
          startTime: currentTime,
          endTime: event.startTime,
          color: "hsl(40 100% 55%)", // Amber
        });
      }
      
      // RUNNING state
      stateBlocks.push({
        processId: process.id,
        state: "RUNNING",
        startTime: event.startTime,
        endTime: event.endTime,
        color: "hsl(150 100% 45%)", // Green
      });
      
      currentTime = event.endTime;
    });

    // TERMINATED state
    if (metric.completionTime > currentTime) {
      currentTime = metric.completionTime;
    }
    
    stateBlocks.push({
      processId: process.id,
      state: "TERMINATED",
      startTime: currentTime,
      endTime: currentTime + 0.5, // Small duration for visualization
      color: "hsl(280 80% 60%)", // Purple
    });

    return {
      processId: process.id,
      processName: process.name,
      color: process.color,
      stateBlocks,
    };
  });
}

export function extractContextSwitches(ganttChart: ScheduleEvent[]): ContextSwitch[] {
  const switches: ContextSwitch[] = [];
  
  for (let i = 1; i < ganttChart.length; i++) {
    const prev = ganttChart[i - 1];
    const curr = ganttChart[i];
    
    if (prev.processId !== curr.processId) {
      switches.push({
        time: curr.startTime,
        fromProcessId: prev.processId,
        toProcessId: curr.processId,
        fromProcessName: prev.processName,
        toProcessName: curr.processName,
        switchNumber: switches.length + 1,
      });
    }
  }
  
  return switches;
}

export function calculateResourceMetrics(
  processes: Process[],
  ganttChart: ScheduleEvent[],
  metrics: ProcessMetrics[]
): ResourceMetrics[] {
  const maxTime = Math.max(...ganttChart.map((e) => e.endTime));
  const resourceMetrics: ResourceMetrics[] = [];
  
  for (let time = 0; time <= maxTime; time++) {
    // CPU Utilization at this time
    const isRunning = ganttChart.some((e) => e.startTime <= time && e.endTime > time);
    const cpuUtilization = isRunning ? 100 : 0;
    
    // Ready Queue Length
    const readyProcesses = processes.filter((p) => {
      const isArrived = p.arrivalTime <= time;
      const notCompleted = metrics.find((m) => m.processId === p.id)?.completionTime! > time;
      const notRunning = !ganttChart.some(
        (e) => e.processId === p.id && e.startTime <= time && e.endTime > time
      );
      return isArrived && notCompleted && notRunning;
    });
    const readyQueueLength = readyProcesses.length;
    
    // Memory Usage (simulate: each process uses burst_time × 10MB)
    const activeProcesses = processes.filter((p) => {
      const isArrived = p.arrivalTime <= time;
      const notCompleted = metrics.find((m) => m.processId === p.id)?.completionTime! > time;
      return isArrived && notCompleted;
    });
    const memoryUsage = activeProcesses.reduce((sum, p) => sum + p.burstTime * 10, 0);
    
    // Completed Processes
    const completedProcesses = metrics.filter((m) => m.completionTime <= time).length;
    
    resourceMetrics.push({
      time,
      cpuUtilization,
      readyQueueLength,
      memoryUsage,
      completedProcesses,
    });
  }
  
  return resourceMetrics;
}
