import { SystemScheduleConfig, CustomAlgorithm } from "@/types/advancedScheduling";

export const defaultSingleCoreConfig: SystemScheduleConfig = {
  cores: [
    {
      coreId: "core-1",
      name: "CPU Core 1",
      color: "hsl(var(--chart-1))",
      queues: [
        {
          queueId: "q1",
          name: "Default Queue",
          priority: 0,
          algorithm: "FCFS",
        },
      ],
    },
  ],
  loadBalancing: "round_robin",
  migrationPolicy: {
    enabled: false,
  },
};

export const mlfqTemplate: SystemScheduleConfig = {
  cores: [
    {
      coreId: "core-1",
      name: "CPU Core 1",
      color: "hsl(var(--chart-1))",
      queues: [
        {
          queueId: "q0-interactive",
          name: "Interactive (Highest Priority)",
          priority: 0,
          algorithm: "RoundRobin",
          quantum: 2,
          demotionRule: {
            enabled: true,
            condition: "quantum_expired",
            threshold: 1,
            targetQueueId: "q1-medium",
          },
        },
        {
          queueId: "q1-medium",
          name: "Medium Priority",
          priority: 1,
          algorithm: "RoundRobin",
          quantum: 4,
          promotionRule: {
            enabled: true,
            condition: "waiting_time",
            threshold: 10,
            targetQueueId: "q0-interactive",
          },
          demotionRule: {
            enabled: true,
            condition: "quantum_expired",
            threshold: 2,
            targetQueueId: "q2-background",
          },
        },
        {
          queueId: "q2-background",
          name: "Background (Lowest Priority)",
          priority: 2,
          algorithm: "FCFS",
          promotionRule: {
            enabled: true,
            condition: "waiting_time",
            threshold: 20,
            targetQueueId: "q1-medium",
          },
        },
      ],
    },
  ],
  loadBalancing: "round_robin",
  migrationPolicy: {
    enabled: false,
  },
};

export const dualCoreTemplate: SystemScheduleConfig = {
  cores: [
    {
      coreId: "core-1",
      name: "CPU Core 1",
      color: "hsl(var(--chart-1))",
      queues: [
        {
          queueId: "q1-c1",
          name: "Core 1 Queue",
          priority: 0,
          algorithm: "RoundRobin",
          quantum: 2,
        },
      ],
    },
    {
      coreId: "core-2",
      name: "CPU Core 2",
      color: "hsl(var(--chart-2))",
      queues: [
        {
          queueId: "q1-c2",
          name: "Core 2 Queue",
          priority: 0,
          algorithm: "RoundRobin",
          quantum: 2,
        },
      ],
    },
  ],
  loadBalancing: "least_loaded",
  migrationPolicy: {
    enabled: true,
    type: "work_stealing",
  },
};

export const priorityMultiQueueTemplate: SystemScheduleConfig = {
  cores: [
    {
      coreId: "core-1",
      name: "CPU Core 1",
      color: "hsl(var(--chart-1))",
      queues: [
        {
          queueId: "q0-system",
          name: "System Tasks",
          priority: 0,
          algorithm: "Priority",
        },
        {
          queueId: "q1-user",
          name: "User Tasks",
          priority: 1,
          algorithm: "SJF",
        },
        {
          queueId: "q2-batch",
          name: "Batch Jobs",
          priority: 2,
          algorithm: "FCFS",
        },
      ],
    },
  ],
  loadBalancing: "round_robin",
  migrationPolicy: {
    enabled: false,
  },
};

export const configTemplates = {
  "Single Core": defaultSingleCoreConfig,
  "Multi-Level Feedback Queue": mlfqTemplate,
  "Dual-Core Load Balanced": dualCoreTemplate,
  "Priority Multi-Queue": priorityMultiQueueTemplate,
};

export const defaultCustomAlgorithm: CustomAlgorithm = {
  id: "custom-1",
  name: "Custom Algorithm",
  description: "User-defined scheduling algorithm",
  selectionLogic: {
    type: "formula",
    formula: "burstTime",
  },
};
