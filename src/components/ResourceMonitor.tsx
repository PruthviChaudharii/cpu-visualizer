import { ResourceMetrics } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { InlinePlaybackControls } from "@/components/InlinePlaybackControls";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Cpu, Database, ListChecks, Activity } from "lucide-react";

interface ResourceMonitorProps {
  resourceMetrics: ResourceMetrics[];
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onStepBack: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export function ResourceMonitor({
  resourceMetrics,
  currentTime,
  maxTime,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStepBack,
  speed,
  onSpeedChange,
  disabled = false,
}: ResourceMonitorProps) {
  if (resourceMetrics.length === 0) {
    return null;
  }

  const visibleData = resourceMetrics.filter((m) => m.time <= Math.ceil(currentTime));
  const currentMetrics = resourceMetrics[Math.floor(currentTime)] || resourceMetrics[0];

  return (
    <Card className="glass-panel p-6 hover:shadow-elevation transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Resource Usage Monitor
        </h3>
      </div>

      <InlinePlaybackControls
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        onStep={onStep}
        onStepBack={onStepBack}
        speed={speed}
        onSpeedChange={onSpeedChange}
        currentTime={currentTime}
        maxTime={maxTime}
        disabled={disabled}
      />

      {/* Real-time Stats Panel */}
      <div className="grid grid-cols-4 gap-4 mb-6 mt-6">
        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-process-teal" />
            <span className="text-xs text-muted-foreground">CPU Usage</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {currentMetrics.cpuUtilization}%
          </div>
        </motion.div>

        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-process-amber" />
            <span className="text-xs text-muted-foreground">Ready Queue</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {currentMetrics.readyQueueLength}
          </div>
        </motion.div>

        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-process-purple" />
            <span className="text-xs text-muted-foreground">Memory</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {currentMetrics.memoryUsage}MB
          </div>
        </motion.div>

        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {currentMetrics.completedProcesses}
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* CPU Utilization Line Chart */}
        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-3">CPU Utilization</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={visibleData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--process-teal))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--process-teal))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "10px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "10px" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cpuUtilization"
                stroke="hsl(var(--process-teal))"
                fill="url(#cpuGradient)"
                strokeWidth={2}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Ready Queue Bar Chart */}
        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-3">Ready Queue Length</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "10px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="readyQueueLength"
                fill="hsl(var(--process-amber))"
                radius={[4, 4, 0, 0]}
                animationDuration={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Memory Usage Stacked Area Chart */}
        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-3">Memory Usage</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={visibleData}>
              <defs>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--process-purple))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--process-purple))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "10px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="memoryUsage"
                stroke="hsl(var(--process-purple))"
                fill="url(#memoryGradient)"
                strokeWidth={2}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Throughput Cumulative Area Chart */}
        <motion.div
          className="glass-panel p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-3">Completed Processes</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "10px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="stepAfter"
                dataKey="completedProcesses"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 3 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Card>
  );
}
