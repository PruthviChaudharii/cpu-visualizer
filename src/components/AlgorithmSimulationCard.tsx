import { useState, useEffect } from "react";
import { Process, AlgorithmType, ScheduleEvent, ProcessMetrics, SystemMetrics } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GanttChart } from "@/components/GanttChart";
import { CPUUtilizationGraph } from "@/components/CPUUtilizationGraph";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import { motion } from "framer-motion";
import {
  assignColors,
  calculateFCFS,
  calculateSJF,
  calculateSRTF,
  calculateRoundRobin,
  calculatePriority,
} from "@/utils/schedulingAlgorithms";

interface AlgorithmSimulationCardProps {
  algorithm: AlgorithmType;
  processes: Process[];
  quantum: number;
  index: number;
}

export function AlgorithmSimulationCard({
  algorithm,
  processes,
  quantum,
  index,
}: AlgorithmSimulationCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [ganttChart, setGanttChart] = useState<ScheduleEvent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    cpuUtilization: 0,
    throughput: 0,
    contextSwitches: 0,
  });

  useEffect(() => {
    runSimulation();
  }, [processes, algorithm, quantum]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && ganttChart.length > 0) {
      const maxTime = Math.max(...ganttChart.map((e) => e.endTime));
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * speed;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, ganttChart]);

  const runSimulation = () => {
    if (processes.length === 0) return;

    const processesWithColors = assignColors(
      processes.map((p) => ({ ...p, remainingTime: p.burstTime }))
    );

    let result;
    switch (algorithm) {
      case "FCFS":
        result = calculateFCFS(processesWithColors);
        break;
      case "SJF":
        result = calculateSJF(processesWithColors);
        break;
      case "SRTF":
        result = calculateSRTF(processesWithColors);
        break;
      case "RoundRobin":
        result = calculateRoundRobin(processesWithColors, quantum);
        break;
      case "Priority":
        result = calculatePriority(processesWithColors, false);
        break;
      case "Priority-Preemptive":
        result = calculatePriority(processesWithColors, true);
        break;
      default:
        result = calculateFCFS(processesWithColors);
    }

    setGanttChart(result.ganttChart);
    setSystemMetrics(result.systemMetrics);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const maxTime = ganttChart.length > 0 ? Math.max(...ganttChart.map((e) => e.endTime)) : 0;

  const handleStep = () => {
    if (maxTime === 0) return;
    setCurrentTime((prev) => Math.min(prev + 1, maxTime));
  };

  const handleStepBack = () => {
    setCurrentTime((prev) => Math.max(prev - 1, 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary glow-text">
            {algorithm}
          </h3>
          <div className="flex items-center gap-2">
            {[0.5, 1, 2, 4].map((s) => (
              <Button
                key={s}
                onClick={() => setSpeed(s)}
                variant={speed === s ? "default" : "outline"}
                size="sm"
                className={
                  speed === s
                    ? "bg-secondary hover:bg-secondary/80"
                    : "border-border hover:bg-muted/50"
                }
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            variant="outline"
            size="sm"
            className="border-border hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleStepBack}
            variant="outline"
            size="sm"
            disabled={isPlaying || currentTime === 0}
            className="border-border hover:bg-muted/50"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="sm"
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-6"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            onClick={handleStep}
            variant="outline"
            size="sm"
            disabled={isPlaying || currentTime >= maxTime}
            className="border-border hover:bg-muted/50"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground ml-auto font-mono">
            {currentTime.toFixed(1)} / {maxTime.toFixed(1)}
          </span>
        </div>

        <GanttChart 
          events={ganttChart} 
          currentTime={currentTime}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onReset={() => {
            setCurrentTime(0);
            setIsPlaying(false);
          }}
          onStep={() => setCurrentTime(prev => Math.min(prev + 1, maxTime))}
          onStepBack={() => setCurrentTime(prev => Math.max(prev - 1, 0))}
          speed={speed}
          onSpeedChange={setSpeed}
          maxTime={maxTime}
        />

        <CPUUtilizationGraph 
          events={ganttChart} 
          currentTime={currentTime}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onReset={() => {
            setCurrentTime(0);
            setIsPlaying(false);
          }}
          onStep={() => setCurrentTime(prev => Math.min(prev + 1, maxTime))}
          onStepBack={() => setCurrentTime(prev => Math.max(prev - 1, 0))}
          speed={speed}
          onSpeedChange={setSpeed}
          maxTime={maxTime}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <MetricCard
            label="Avg Wait"
            value={systemMetrics.averageWaitingTime.toFixed(2)}
            color="hsl(180 100% 50%)"
          />
          <MetricCard
            label="Avg TAT"
            value={systemMetrics.averageTurnaroundTime.toFixed(2)}
            color="hsl(150 100% 45%)"
          />
          <MetricCard
            label="CPU Util"
            value={`${systemMetrics.cpuUtilization.toFixed(1)}%`}
            color="hsl(280 80% 60%)"
          />
          <MetricCard
            label="Throughput"
            value={systemMetrics.throughput.toFixed(3)}
            color="hsl(40 100% 55%)"
          />
          <MetricCard
            label="Ctx Switch"
            value={systemMetrics.contextSwitches.toString()}
            color="hsl(320 80% 60%)"
          />
        </div>
      </Card>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
