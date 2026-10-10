import { useState, useEffect } from "react";
import { Process } from "@/types/scheduling";
import { SystemScheduleConfig, MultiCoreSimulationResult } from "@/types/advancedScheduling";
import { defaultSingleCoreConfig } from "@/utils/systemConfigDefaults";
import { simulateMultiCore } from "@/utils/multiCoreScheduler";
import { SystemConfigBuilder } from "./SystemConfigBuilder";
import { MultiCoreGanttChart } from "./MultiCoreGanttChart";
import { CoreLoadMonitor } from "./CoreLoadMonitor";
import { AdvancedMetricsDisplay } from "./AdvancedMetricsDisplay";
import { ProcessInput } from "./ProcessInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Settings, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomSchedulerTabProps {
  initialProcesses: Process[];
}

export function CustomSchedulerTab({ initialProcesses }: CustomSchedulerTabProps) {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [config, setConfig] = useState<SystemScheduleConfig>(defaultSingleCoreConfig);
  const [simulationResult, setSimulationResult] = useState<MultiCoreSimulationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  const maxTime = simulationResult
    ? Math.max(...simulationResult.coreResults.flatMap((cr) => cr.ganttChart.map((e) => e.endTime)), 1)
    : 0;

  useEffect(() => {
    if (!isPlaying || !simulationResult) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return prev + 0.1 * speed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, maxTime, speed, simulationResult]);

  const runSimulation = () => {
    if (processes.length === 0) {
      return;
    }

    const result = simulateMultiCore(processes, config);
    setSimulationResult(result);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!simulationResult) {
      runSimulation();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary glow-text mb-2">
          Custom Scheduler Builder
        </h2>
        <p className="text-muted-foreground">
          Design your own multi-core, multi-queue scheduling system
        </p>
      </div>

      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">
            <Settings className="w-4 h-4 mr-2" />
            Configure System
          </TabsTrigger>
          <TabsTrigger value="processes">
            <BarChart3 className="w-4 h-4 mr-2" />
            Manage Processes
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!simulationResult}>
            <Play className="w-4 h-4 mr-2" />
            View Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6 mt-6">
          <SystemConfigBuilder config={config} onConfigChange={setConfig} />
        </TabsContent>

        <TabsContent value="processes" className="space-y-6 mt-6">
          <ProcessInput
            processes={processes}
            onProcessesChange={setProcesses}
            showPriority={true}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6 mt-6">
          {simulationResult && (
            <>
              <Card className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button onClick={handlePlayPause} variant="default">
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Time: {currentTime.toFixed(1)} / {maxTime.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    {[0.5, 1, 2, 4].map((s) => (
                      <Button
                        key={s}
                        onClick={() => setSpeed(s)}
                        variant={speed === s ? "default" : "outline"}
                        size="sm"
                      >
                        {s}x
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              <MultiCoreGanttChart coreResults={simulationResult.coreResults} currentTime={currentTime} />
              
              <div className="grid grid-cols-2 gap-6">
                <CoreLoadMonitor coreResults={simulationResult.coreResults} />
                <AdvancedMetricsDisplay metrics={simulationResult.systemMetrics} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 right-6 z-10">
        <Button onClick={runSimulation} size="lg" className="shadow-lg">
          <Play className="w-5 h-5 mr-2" />
          Run Simulation
        </Button>
      </div>
    </div>
  );
}
