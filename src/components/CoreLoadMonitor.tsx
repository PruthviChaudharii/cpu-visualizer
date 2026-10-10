import { CoreSimulationResult } from "@/types/advancedScheduling";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface CoreLoadMonitorProps {
  coreResults: CoreSimulationResult[];
}

export function CoreLoadMonitor({ coreResults }: CoreLoadMonitorProps) {
  const avgUtilization =
    coreResults.reduce((sum, core) => sum + core.utilization, 0) / (coreResults.length || 1);

  const loadVariance =
    coreResults.reduce((sum, core) => sum + Math.pow(core.utilization - avgUtilization, 2), 0) /
    (coreResults.length || 1);

  const loadBalance = Math.max(0, 100 - Math.sqrt(loadVariance));

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Core Load Monitor
      </h3>

      <div className="space-y-4">
        {coreResults.map((core, index) => (
          <div key={core.coreId} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Core {index + 1}</span>
              <span className="text-muted-foreground">{core.utilization.toFixed(1)}%</span>
            </div>
            <Progress value={core.utilization} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{core.completedProcessCount} processes</span>
              <span>
                {core.ganttChart.length > 0
                  ? `${core.ganttChart[0].startTime} - ${core.ganttChart[core.ganttChart.length - 1]?.endTime || 0}`
                  : "No activity"}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Average Utilization</span>
            <span className="text-sm text-muted-foreground">{avgUtilization.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Load Balance Score</span>
            <span className="text-sm text-muted-foreground">{loadBalance.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Load Variance</span>
            <span className="text-sm text-muted-foreground">{Math.sqrt(loadVariance).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
