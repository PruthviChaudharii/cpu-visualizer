import { useState } from "react";
import { Process } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProcessInputProps {
  processes: Process[];
  onProcessesChange: (processes: Process[]) => void;
  showPriority?: boolean;
}

const processColorClasses = [
  "bg-process-teal",
  "bg-process-blue", 
  "bg-process-purple",
  "bg-process-amber",
];

export function ProcessInput({
  processes,
  onProcessesChange,
  showPriority = false,
}: ProcessInputProps) {
  const [newProcess, setNewProcess] = useState({
    arrivalTime: 0,
    burstTime: 5,
    priority: 1,
  });

  const addProcess = () => {
    if (newProcess.burstTime <= 0) {
      toast.error("Burst time must be greater than 0");
      return;
    }

    const processId = `P${processes.length + 1}`;
    const process: Process = {
      id: processId,
      name: processId,
      arrivalTime: newProcess.arrivalTime,
      burstTime: newProcess.burstTime,
      priority: newProcess.priority,
      remainingTime: newProcess.burstTime,
      color: "",
    };

    onProcessesChange([...processes, process]);
    toast.success(`Process ${processId} added`);
  };

  const removeProcess = (id: string) => {
    onProcessesChange(processes.filter((p) => p.id !== id));
    toast.success("Process removed");
  };

  const updateProcess = (id: string, field: keyof Process, value: string | number) => {
    onProcessesChange(
      processes.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value,
              ...(field === "burstTime" ? { remainingTime: Number(value) } : {}),
            }
          : p
      )
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6 animate-fade-in">
      {/* Left Card - Add Process */}
      <Card className="glass-panel p-6">
        <h3 className="text-base font-semibold mb-5 text-muted-foreground uppercase tracking-wide">
          Add Process
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrival" className="text-sm font-semibold text-foreground mb-2 block">
                Arrival Time
              </Label>
              <Input
                id="arrival"
                type="number"
                min="0"
                value={newProcess.arrivalTime}
                onChange={(e) =>
                  setNewProcess({ ...newProcess, arrivalTime: parseInt(e.target.value) || 0 })
                }
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="burst" className="text-sm font-semibold text-foreground mb-2 block">
                Burst Time
              </Label>
              <Input
                id="burst"
                type="number"
                min="1"
                value={newProcess.burstTime}
                onChange={(e) =>
                  setNewProcess({ ...newProcess, burstTime: parseInt(e.target.value) || 1 })
                }
                className="w-full"
              />
            </div>
          </div>

          {showPriority && (
            <div>
              <Label htmlFor="priority" className="text-sm font-semibold text-foreground mb-2 block">
                Priority
              </Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={newProcess.priority}
                onChange={(e) =>
                  setNewProcess({ ...newProcess, priority: parseInt(e.target.value) || 1 })
                }
                className="w-full"
              />
            </div>
          )}

          <Button
            onClick={addProcess}
            variant="gradient"
            size="lg"
            className="w-full text-base"
          >
            Add Process
          </Button>
        </div>
      </Card>

      {/* Right Card - Process List */}
      <Card className="glass-panel p-6 max-h-[420px] overflow-y-auto">
        <h3 className="text-base font-semibold mb-5 text-muted-foreground uppercase tracking-wide sticky top-0 bg-inherit pb-2">
          Process List
        </h3>
        
        <div className="space-y-3">
          {processes.map((process, index) => (
            <div
              key={process.id}
              className="glass-panel p-4 hover:bg-white/8 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                {/* Color Dot */}
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  processColorClasses[index % processColorClasses.length]
                )} />

                {/* Process Name */}
                <div className="text-base font-semibold text-foreground w-20">
                  Name: {process.name}
                </div>

                {/* Arrival Time */}
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Arrival
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={(e) =>
                      updateProcess(process.id, "arrivalTime", parseInt(e.target.value) || 0)
                    }
                    className="h-11 text-sm"
                  />
                </div>

                {/* Burst Time */}
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Burst
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={(e) =>
                      updateProcess(process.id, "burstTime", parseInt(e.target.value) || 1)
                    }
                    className="h-11 text-sm"
                  />
                </div>

                {/* Priority (if needed) */}
                {showPriority && (
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Priority
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={process.priority}
                      onChange={(e) =>
                        updateProcess(process.id, "priority", parseInt(e.target.value) || 1)
                      }
                      className="h-11 text-sm"
                    />
                  </div>
                )}

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProcess(process.id)}
                  className="flex-shrink-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {processes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No processes added yet. Add a process to get started.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
