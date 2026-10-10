import { ProcessMetrics, SystemMetrics } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Zap, Cpu, TrendingUp, GitBranch } from "lucide-react";

interface MetricsDisplayProps {
  processMetrics: ProcessMetrics[];
  systemMetrics: SystemMetrics;
}

export function MetricsDisplay({
  processMetrics,
  systemMetrics,
}: MetricsDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Wait Time"
          value={systemMetrics.averageWaitingTime.toFixed(2)}
          color="hsl(180 100% 50%)"
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Avg Turnaround"
          value={systemMetrics.averageTurnaroundTime.toFixed(2)}
          color="hsl(150 100% 45%)"
        />
        <MetricCard
          icon={<Cpu className="h-5 w-5" />}
          label="CPU Usage"
          value={`${systemMetrics.cpuUtilization.toFixed(1)}%`}
          color="hsl(280 80% 60%)"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Throughput"
          value={systemMetrics.throughput.toFixed(3)}
          color="hsl(40 100% 55%)"
        />
        <MetricCard
          icon={<GitBranch className="h-5 w-5" />}
          label="Ctx Switches"
          value={systemMetrics.contextSwitches.toString()}
          color="hsl(320 80% 60%)"
        />
      </div>

      {processMetrics.length > 0 && (
        <Card className="p-4 bg-card/30 backdrop-blur border-border">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Process Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Process
                  </th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Wait Time
                  </th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Turnaround
                  </th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Response
                  </th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {processMetrics.map((metric, index) => (
                  <motion.tr
                    key={metric.processId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="py-2 px-3 font-semibold text-foreground">
                      {metric.processName}
                    </td>
                    <td className="py-2 px-3 text-foreground">
                      {metric.waitingTime.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-foreground">
                      {metric.turnaroundTime.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-foreground">
                      {metric.responseTime.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-foreground">
                      {metric.completionTime.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
