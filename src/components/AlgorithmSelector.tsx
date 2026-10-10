import { AlgorithmType } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AlgorithmSelectorProps {
  selected: AlgorithmType;
  onSelect: (algorithm: AlgorithmType) => void;
  quantum: number;
  onQuantumChange: (quantum: number) => void;
}

const algorithms: { value: AlgorithmType; label: string; desc: string }[] = [
  { value: "FCFS", label: "FCFS", desc: "First Come First Serve" },
  { value: "SJF", label: "SJF", desc: "Shortest Job First" },
  { value: "SRTF", label: "SRTF", desc: "Shortest Remaining Time First" },
  { value: "Priority", label: "Priority", desc: "Non-Preemptive" },
  { value: "Priority-Preemptive", label: "Priority+", desc: "Preemptive" },
  { value: "RoundRobin", label: "Round Robin", desc: "Time Quantum" },
];

export function AlgorithmSelector({
  selected,
  onSelect,
  quantum,
  onQuantumChange,
}: AlgorithmSelectorProps) {
  return (
    <Card className="glass-panel p-6 animate-fade-in">
      <h3 className="text-base font-semibold mb-5 text-muted-foreground uppercase tracking-wide">
        Scheduling Algorithm
      </h3>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {algorithms.map((algo) => (
          <button
            key={algo.value}
            onClick={() => onSelect(algo.value)}
            className={cn(
              "flex flex-col items-start justify-center h-[92px] rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
              selected === algo.value
                ? "bg-primary/20 border-2 border-primary/45 shadow-lg"
                : "glass-panel hover:bg-white/10"
            )}
          >
            <div className="px-5 py-4 w-full">
              <div className="text-lg font-bold text-foreground mb-0.5">
                {algo.label}
              </div>
              <div className="text-[13px] font-medium text-muted-foreground">
                {algo.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected === "RoundRobin" && (
        <div className="pt-5 border-t border-white/6 animate-slide-in">
          <Label htmlFor="quantum" className="text-sm font-semibold text-foreground mb-2 block">
            Time Quantum
          </Label>
          <Input
            id="quantum"
            type="number"
            min="1"
            value={quantum}
            onChange={(e) => onQuantumChange(parseInt(e.target.value) || 1)}
            className="max-w-xs"
          />
        </div>
      )}
    </Card>
  );
}
