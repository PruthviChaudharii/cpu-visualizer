import { CoreSimulationResult } from "@/types/advancedScheduling";
import { Card } from "@/components/ui/card";
import { ScheduleEvent } from "@/types/scheduling";

interface MultiCoreGanttChartProps {
  coreResults: CoreSimulationResult[];
  currentTime?: number;
}

export function MultiCoreGanttChart({ coreResults, currentTime = 0 }: MultiCoreGanttChartProps) {
  const maxTime = Math.max(
    ...coreResults.flatMap((core) => core.ganttChart.map((event) => event.endTime)),
    1
  );

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Core Gantt Chart</h3>
      <div className="space-y-6">
        {coreResults.map((coreResult, index) => (
          <div key={coreResult.coreId}>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Core {index + 1}
              </div>
              <div className="text-xs text-muted-foreground">
                ({coreResult.completedProcessCount} processes, {coreResult.utilization.toFixed(1)}% utilization)
              </div>
            </div>
            
            <div className="relative h-16 bg-background/50 rounded-lg border border-border overflow-hidden">
              {/* Time markers */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-l border-border/30"
                    style={{ left: `${(i / maxTime) * 100}%`, position: "absolute", height: "100%" }}
                  />
                ))}
              </div>

              {/* Process blocks */}
              {coreResult.ganttChart.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className="absolute top-2 bottom-2 rounded flex items-center justify-center text-xs font-medium text-white transition-all hover:scale-105"
                  style={{
                    left: `${(event.startTime / maxTime) * 100}%`,
                    width: `${((event.endTime - event.startTime) / maxTime) * 100}%`,
                    backgroundColor: event.color,
                  }}
                  title={`${event.processName}: ${event.startTime} - ${event.endTime}`}
                >
                  {event.processName}
                </div>
              ))}

              {/* Current time indicator */}
              {currentTime > 0 && currentTime <= maxTime && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: `${(currentTime / maxTime) * 100}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                </div>
              )}
            </div>

            {/* Time labels */}
            <div className="relative h-6 mt-1">
              {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground"
                  style={{ left: `${(i / maxTime) * 100}%`, transform: "translateX(-50%)" }}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
