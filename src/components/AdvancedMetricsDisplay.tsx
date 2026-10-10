import { AdvancedSystemMetrics } from "@/types/advancedScheduling";
import { Card } from "@/components/ui/card";
import { BarChart3, Clock, Cpu, Zap, GitBranch, TrendingUp } from "lucide-react";

interface AdvancedMetricsDisplayProps {
  metrics: AdvancedSystemMetrics;
}

export function AdvancedMetricsDisplay({ metrics }: AdvancedMetricsDisplayProps) {
  const metricCards = [
    {
      label: "Avg Waiting Time",
      value: metrics.averageWaitingTime.toFixed(2),
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Avg Turnaround Time",
      value: metrics.averageTurnaroundTime.toFixed(2),
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "CPU Utilization",
      value: `${metrics.cpuUtilization.toFixed(1)}%`,
      icon: Cpu,
      color: "text-green-500",
    },
    {
      label: "Throughput",
      value: metrics.throughput.toFixed(2),
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      label: "Context Switches",
      value: metrics.contextSwitches.toString(),
      icon: GitBranch,
      color: "text-orange-500",
    },
    {
      label: "Load Balance Efficiency",
      value: `${metrics.loadBalancingEfficiency.toFixed(1)}%`,
      icon: BarChart3,
      color: "text-cyan-500",
    },
  ];

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">System Performance Metrics</h3>
      <div className="grid grid-cols-3 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-card/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            </div>
          );
        })}
      </div>

      {metrics.perCoreUtilization.length > 1 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Per-Core Utilization</h4>
          <div className="grid grid-cols-4 gap-3">
            {metrics.perCoreUtilization.map((util, index) => (
              <div key={index} className="bg-card/50 rounded p-3 text-center border border-border">
                <div className="text-xs text-muted-foreground mb-1">Core {index + 1}</div>
                <div className="text-lg font-bold text-foreground">{util.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
