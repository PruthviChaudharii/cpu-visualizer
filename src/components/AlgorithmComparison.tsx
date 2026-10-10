import { Process } from "@/types/scheduling";
import { AlgorithmSimulationCard } from "@/components/AlgorithmSimulationCard";
import { Card } from "@/components/ui/card";

interface AlgorithmComparisonProps {
  processes: Process[];
  quantum: number;
}

export function AlgorithmComparison({
  processes,
  quantum,
}: AlgorithmComparisonProps) {
  if (processes.length === 0) {
    return (
      <Card className="p-6 bg-card/30 backdrop-blur border-border">
        <div className="text-center text-muted-foreground py-12">
          Add processes to see algorithm comparison
        </div>
      </Card>
    );
  }

  const algorithms = ["FCFS", "SJF", "SRTF", "Priority", "Priority-Preemptive", "RoundRobin"];

  return (
    <div className="space-y-6 pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary glow-text mb-2">
          Algorithm Comparison
        </h2>
        <p className="text-muted-foreground">
          Compare all scheduling algorithms side-by-side
        </p>
      </div>

      <div className="space-y-6">
        {algorithms.map((algo, index) => (
          <AlgorithmSimulationCard
            key={algo}
            algorithm={algo as any}
            processes={processes}
            quantum={quantum}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
