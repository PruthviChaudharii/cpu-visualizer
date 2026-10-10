import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Process, AlgorithmType, ScheduleEvent, ProcessMetrics, SystemMetrics } from "@/types/scheduling";
import { GanttChart } from "@/components/GanttChart";
import { ProcessInput } from "@/components/ProcessInput";
import { MetricsDisplay } from "@/components/MetricsDisplay";
import { AlgorithmSelector } from "@/components/AlgorithmSelector";

import { ProcessStateDiagram } from "@/components/ProcessStateDiagram";
import { AlgorithmComparison } from "@/components/AlgorithmComparison";
import { CustomSchedulerTab } from "@/components/CustomSchedulerTab";
import { ExportControls } from "@/components/ExportControls";
import { CPUUtilizationGraph } from "@/components/CPUUtilizationGraph";
import { ProcessTimelineView } from "@/components/ProcessTimelineView";
import { ContextSwitchTimeline } from "@/components/ContextSwitchTimeline";
import { ResourceMonitor } from "@/components/ResourceMonitor";
import { NarrationControls } from "@/components/NarrationControls";
import { NarrationSubtitles } from "@/components/NarrationSubtitles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  assignColors,
  calculateFCFS,
  calculateSJF,
  calculateSRTF,
  calculateRoundRobin,
  calculatePriority,
  generateProcessTimelines,
  extractContextSwitches,
  calculateResourceMetrics,
} from "@/utils/schedulingAlgorithms";
import { ProcessTimeline, ContextSwitch, ResourceMetrics } from "@/types/scheduling";
import { toast } from "sonner";
import { ArrowLeft, Play, BarChart3, Settings } from "lucide-react";
import { useNarration } from "@/hooks/useNarration";
import {
  generateAlgorithmIntro,
  generateProcessStateNarration,
  generateContextSwitchNarration,
  generateMetricsNarration,
  generateSimulationStartNarration,
  generateSimulationCompleteNarration,
} from "@/utils/narrationScripts";

const defaultProcesses: Process[] = [
  { id: "P1", name: "P1", arrivalTime: 0, burstTime: 5, priority: 2, remainingTime: 5, color: "" },
  { id: "P2", name: "P2", arrivalTime: 1, burstTime: 3, priority: 1, remainingTime: 3, color: "" },
  { id: "P3", name: "P3", arrivalTime: 2, burstTime: 8, priority: 3, remainingTime: 8, color: "" },
  { id: "P4", name: "P4", arrivalTime: 3, burstTime: 6, priority: 2, remainingTime: 6, color: "" },
];

const Simulation = () => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>(assignColors(defaultProcesses));
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [ganttChart, setGanttChart] = useState<ScheduleEvent[]>([]);
  const [processMetrics, setProcessMetrics] = useState<ProcessMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    cpuUtilization: 0,
    throughput: 0,
    contextSwitches: 0,
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [simulationData, setSimulationData] = useState<{
    events: ScheduleEvent[];
    maxTime: number;
  }>({ events: [], maxTime: 0 });

  const [activeTab, setActiveTab] = useState("simulation");
  
  // Advanced visualization data
  const [processTimelines, setProcessTimelines] = useState<ProcessTimeline[]>([]);
  const [contextSwitches, setContextSwitches] = useState<ContextSwitch[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics[]>([]);
  
  // Voice narration
  const narration = useNarration();
  const [currentNarrationText, setCurrentNarrationText] = useState("");
  const lastNarratedEventRef = useRef<{ type: string; time: number } | null>(null);

  const ganttChartRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProcesses((prev) => assignColors(prev));
  }, []);

  // Playback effect with narration
  useEffect(() => {
    if (!isPlaying || simulationData.maxTime === 0) {
      if (currentTime >= simulationData.maxTime && simulationData.maxTime > 0) {
        setIsPlaying(false);
        
        // Narrate completion
        if (narration.settings.enabled && narration.settings.autoNarrate && systemMetrics) {
          const completeText = generateSimulationCompleteNarration(simulationData.maxTime, processes.length);
          const metricsText = generateMetricsNarration({
            avgWaitingTime: systemMetrics.averageWaitingTime,
            avgTurnaroundTime: systemMetrics.averageTurnaroundTime,
            avgResponseTime: 0,
            cpuUtilization: systemMetrics.cpuUtilization,
            throughput: systemMetrics.throughput,
          });
          narration.speak(completeText);
          narration.speak(metricsText);
          setCurrentNarrationText(metricsText);
          setTimeout(() => setCurrentNarrationText(""), 8000);
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * speed;
        return next >= simulationData.maxTime ? simulationData.maxTime : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, simulationData.maxTime, speed, narration, systemMetrics, processes.length]);

  // Narration for events based on current time - with proper debouncing
  useEffect(() => {
    if (!narration.settings.enabled || !narration.settings.autoNarrate || ganttChart.length === 0) {
      return;
    }

    // Don't queue new narrations while speaking
    if (narration.isSpeaking) {
      return;
    }

    // Use rounded time to reduce triggers
    const roundedCurrentTime = Math.round(currentTime * 2) / 2; // Round to nearest 0.5

    // Priority 1: Check for context switches at EXACT time only
    const exactSwitch = contextSwitches.find(
      sw => Math.abs(sw.time - roundedCurrentTime) < 0.1
    );

    if (exactSwitch) {
      const switchKey = `switch-${exactSwitch.switchNumber}`;
      const lastType = lastNarratedEventRef.current?.type;
      
      if (lastType !== switchKey) {
        console.log(`[Narration] Context Switch #${exactSwitch.switchNumber} at ${exactSwitch.time.toFixed(2)}`);
        
        const text = generateContextSwitchNarration(
          exactSwitch.fromProcessId || null,
          exactSwitch.toProcessId,
          exactSwitch.time,
          exactSwitch.switchNumber
        );
        narration.speak(text, "normal");
        setCurrentNarrationText(text);
        setTimeout(() => setCurrentNarrationText(""), 3000);

        lastNarratedEventRef.current = {
          type: switchKey,
          time: roundedCurrentTime
        };
      }
      return; // Exit after handling switch
    }

    // Priority 2: Narrate current running process
    const currentEvent = ganttChart.find(
      event => roundedCurrentTime >= event.startTime && roundedCurrentTime < event.endTime
    );

    if (currentEvent) {
      const eventKey = `process-${currentEvent.processId}-start-${currentEvent.startTime.toFixed(1)}`;
      const lastType = lastNarratedEventRef.current?.type;

      if (lastType !== eventKey) {
        console.log(`[Narration] Process ${currentEvent.processId} running at ${currentEvent.startTime.toFixed(2)}`);
        
        const text = generateProcessStateNarration(
          currentEvent.processId,
          "running",
          currentEvent.startTime
        );
        narration.speak(text, "normal");
        setCurrentNarrationText(text);
        setTimeout(() => setCurrentNarrationText(""), 3000);

        lastNarratedEventRef.current = {
          type: eventKey,
          time: roundedCurrentTime
        };
      }
    }
  }, [Math.floor(currentTime * 2), ganttChart, contextSwitches, narration.settings.enabled, narration.settings.autoNarrate, narration.isSpeaking]);

  const runSimulation = () => {
    if (processes.length === 0) {
      toast.error("Add at least one process to run the simulation");
      return;
    }

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
    setProcessMetrics(result.metrics);
    setSystemMetrics(result.systemMetrics);
    
    const maxTime = Math.max(...result.ganttChart.map((e) => e.endTime));
    setSimulationData({
      events: result.ganttChart,
      maxTime,
    });
    
    // Generate advanced visualization data
    const timelines = generateProcessTimelines(processesWithColors, result.ganttChart, result.metrics);
    const switches = extractContextSwitches(result.ganttChart);
    const resources = calculateResourceMetrics(processesWithColors, result.ganttChart, result.metrics);
    
    setProcessTimelines(timelines);
    setContextSwitches(switches);
    setResourceMetrics(resources);
    
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Narrate algorithm introduction
    if (narration.settings.enabled && narration.settings.autoNarrate) {
      const introText = generateSimulationStartNarration(processes.length);
      const algoText = generateAlgorithmIntro(algorithm, quantum);
      narration.speak(introText, "high");
      narration.speak(algoText, "high");
      setCurrentNarrationText(algoText);
      setTimeout(() => setCurrentNarrationText(""), 5000);
    }

    lastNarratedEventRef.current = null;
    
    toast.success(`${algorithm} simulation completed!`);
  };

  const handleProcessesChange = (newProcesses: Process[]) => {
    setProcesses(assignColors(newProcesses));
  };

  // Round current time to reduce rapid state changes
  const roundedTime = Math.floor(currentTime);

  // Memoize the current state to prevent unnecessary recalculations
  const { runningProcess, readyQueue, completedProcessIds } = useMemo(() => {
    if (ganttChart.length === 0) {
      return {
        runningProcess: null,
        readyQueue: [],
        completedProcessIds: [],
      };
    }

    const currentEvents = ganttChart.filter(
      (e) => e.startTime <= roundedTime && e.endTime > roundedTime
    );
    const runningEvent = currentEvents[currentEvents.length - 1];
    const runningProcess = runningEvent
      ? processes.find((p) => p.id === runningEvent.processId) || null
      : null;

    const completedProcessIds = Array.from(
      new Set(
        ganttChart
          .filter((e) => e.endTime <= roundedTime)
          .map((e) => e.processId)
      )
    );

    const readyQueue = processes.filter(
      (p) =>
        p.arrivalTime <= roundedTime &&
        !completedProcessIds.includes(p.id) &&
        p.id !== runningProcess?.id
    );

    return { runningProcess, readyQueue, completedProcessIds };
  }, [ganttChart, processes, roundedTime]);

  const handleStep = () => {
    if (simulationData.maxTime === 0) return;
    setCurrentTime((prev) => Math.min(prev + 1, simulationData.maxTime));
  };

  const handleStepBack = () => {
    setCurrentTime((prev) => Math.max(prev - 1, 0));
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <h1 className="text-4xl font-semibold text-center mb-8 tracking-tight">
            CPU Scheduling Simulator
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex justify-center mb-8">
            <TabsList className="w-[700px] h-12">
              <TabsTrigger value="simulation" className="flex-1 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Single Simulation
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex-1 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Compare All
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Custom Scheduler
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="simulation" className="space-y-6 mt-0">
            {/* Algorithm Selector - Full Width */}
            <AlgorithmSelector
              selected={algorithm}
              onSelect={setAlgorithm}
              quantum={quantum}
              onQuantumChange={setQuantum}
            />
            
            {/* Voice Narration Controls */}
            <NarrationControls narration={narration} />

            {/* Process Input - Two Columns */}
            <ProcessInput
              processes={processes}
              onProcessesChange={handleProcessesChange}
              showPriority={algorithm === "Priority" || algorithm === "Priority-Preemptive"}
            />

            {/* Sticky Run Button - Bottom Right */}
            <div className="fixed bottom-7 right-7 z-50">
              <Button
                onClick={runSimulation}
                variant="gradient"
                size="lg"
                className="w-[280px] h-14 text-lg shadow-elevation"
              >
                <Play className="mr-2 h-5 w-5" />
                Run Simulation
              </Button>
            </div>

            {/* Main Content - Visualization */}
            <div className="space-y-6 animate-scale-in mt-6">
                {ganttChart.length > 0 && (
                  <>
                    <div ref={ganttChartRef}>
                      <Card className="glass-panel p-6 hover:shadow-elevation transition-shadow duration-300">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">
                          Gantt Chart Visualization - {algorithm}
                        </h3>
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
                          onStep={handleStep}
                          onStepBack={handleStepBack}
                          speed={speed}
                          onSpeedChange={setSpeed}
                          maxTime={simulationData.maxTime}
                        />
                      </Card>
                    </div>

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
                      onStep={handleStep}
                      onStepBack={handleStepBack}
                      speed={speed}
                      onSpeedChange={setSpeed}
                      maxTime={simulationData.maxTime}
                    />

                    <ProcessStateDiagram
                      processes={processes}
                      runningProcess={runningProcess}
                      readyQueue={readyQueue}
                      completedProcessIds={completedProcessIds}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onReset={() => {
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }}
                      onStep={handleStep}
                      onStepBack={handleStepBack}
                      speed={speed}
                      onSpeedChange={setSpeed}
                      maxTime={simulationData.maxTime}
                    />

                    {/* Advanced Visualizations */}
                    <ProcessTimelineView
                      timelines={processTimelines}
                      currentTime={currentTime}
                      maxTime={simulationData.maxTime}
                      isPlaying={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onReset={() => {
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }}
                      onStep={handleStep}
                      onStepBack={handleStepBack}
                      speed={speed}
                      onSpeedChange={setSpeed}
                    />

                    <ContextSwitchTimeline
                      contextSwitches={contextSwitches}
                      currentTime={currentTime}
                      maxTime={simulationData.maxTime}
                    />

                    <ResourceMonitor
                      resourceMetrics={resourceMetrics}
                      currentTime={currentTime}
                      maxTime={simulationData.maxTime}
                      isPlaying={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onReset={() => {
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }}
                      onStep={handleStep}
                      onStepBack={handleStepBack}
                      speed={speed}
                      onSpeedChange={setSpeed}
                    />

                    <div ref={metricsRef}>
                      <MetricsDisplay
                        processMetrics={processMetrics}
                        systemMetrics={systemMetrics}
                      />
                    </div>

                    <ExportControls
                      ganttChartRef={ganttChartRef}
                      metricsRef={metricsRef}
                    />
                  </>
                )}

                {ganttChart.length === 0 && (
                  <Card className="glass-panel p-12 text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Simulation Running
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Configure your processes and click "Run Simulation" to start
                    </p>
                  </Card>
                )}
              </div>
              
              <NarrationSubtitles 
                isActive={narration.isSpeaking} 
                currentText={currentNarrationText}
              />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <AlgorithmComparison
              processes={processes}
              quantum={quantum}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <CustomSchedulerTab initialProcesses={processes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Simulation;
