import { Process } from "@/types/scheduling";
import { CustomAlgorithm, LogicBlock } from "@/types/advancedScheduling";
import { ProcessScore } from "@/types/customAlgorithm";

export function executeCustomAlgorithm(
  processes: Process[],
  algorithm: CustomAlgorithm,
  currentTime: number
): Process | null {
  if (processes.length === 0) return null;

  const scores = processes.map((process) => ({
    process,
    score: calculateProcessScore(process, algorithm.selectionLogic, currentTime),
    reason: "custom algorithm",
  }));

  // Sort by score (higher is better)
  scores.sort((a, b) => b.score - a.score);

  return scores[0]?.process || null;
}

function calculateProcessScore(
  process: Process,
  selectionLogic: CustomAlgorithm["selectionLogic"],
  currentTime: number
): number {
  if (selectionLogic.type === "formula" && selectionLogic.formula) {
    return evaluateFormula(selectionLogic.formula, process, currentTime);
  }

  if (selectionLogic.type === "blocks" && selectionLogic.blocks) {
    return evaluateBlocks(selectionLogic.blocks, process, currentTime);
  }

  return 0;
}

function evaluateFormula(formula: string, process: Process, currentTime: number): number {
  try {
    // Create a safe evaluation context
    const waitingTime = Math.max(0, currentTime - process.arrivalTime);
    const context = {
      burstTime: process.burstTime,
      remainingTime: process.remainingTime,
      priority: process.priority,
      arrivalTime: process.arrivalTime,
      waitingTime,
      currentTime,
    };

    // Replace variable names in formula
    let evaluableFormula = formula;
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, "g");
      evaluableFormula = evaluableFormula.replace(regex, value.toString());
    });

    // Use Function constructor for safer evaluation (no access to outer scope)
    const result = new Function(`return ${evaluableFormula}`)();
    return typeof result === "number" && !isNaN(result) ? result : 0;
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return 0;
  }
}

function evaluateBlocks(blocks: LogicBlock[], process: Process, currentTime: number): number {
  let score = 0;
  const waitingTime = Math.max(0, currentTime - process.arrivalTime);

  for (const block of blocks) {
    switch (block.operation) {
      case "shortest_burst":
        score -= process.burstTime;
        break;
      case "longest_burst":
        score += process.burstTime;
        break;
      case "highest_priority":
        score -= process.priority; // Lower priority number = higher priority
        break;
      case "lowest_priority":
        score += process.priority;
        break;
      case "earliest_arrival":
        score -= process.arrivalTime;
        break;
      case "latest_arrival":
        score += process.arrivalTime;
        break;
      case "if_waiting_gt":
        if (block.value && waitingTime > block.value) {
          score += 100;
        }
        break;
      case "if_burst_lt":
        if (block.value && process.burstTime < block.value) {
          score += 50;
        }
        break;
      default:
        break;
    }
  }

  return score;
}

export function validateCustomAlgorithm(algorithm: CustomAlgorithm): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!algorithm.name || algorithm.name.trim() === "") {
    errors.push("Algorithm name is required");
  }

  if (algorithm.selectionLogic.type === "formula") {
    if (!algorithm.selectionLogic.formula || algorithm.selectionLogic.formula.trim() === "") {
      errors.push("Formula is required");
    } else {
      // Test formula with dummy data
      const testProcess: Process = {
        id: "test",
        name: "Test",
        arrivalTime: 0,
        burstTime: 5,
        priority: 1,
        remainingTime: 5,
        color: "#000",
      };
      try {
        evaluateFormula(algorithm.selectionLogic.formula, testProcess, 0);
      } catch (error) {
        errors.push("Invalid formula syntax");
      }
    }
  }

  if (algorithm.selectionLogic.type === "blocks") {
    if (!algorithm.selectionLogic.blocks || algorithm.selectionLogic.blocks.length === 0) {
      errors.push("At least one logic block is required");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
