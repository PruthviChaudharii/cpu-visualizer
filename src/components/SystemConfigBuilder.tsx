import { useState } from "react";
import { SystemScheduleConfig, CoreConfig, QueueConfig } from "@/types/advancedScheduling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Cpu, ListOrdered, Settings, Network } from "lucide-react";
import { ConfigurationTemplates } from "./ConfigurationTemplates";
import { SystemConfigTreeView } from "./SystemConfigTreeView";

interface SystemConfigBuilderProps {
  config: SystemScheduleConfig;
  onConfigChange: (config: SystemScheduleConfig) => void;
}

export function SystemConfigBuilder({ config, onConfigChange }: SystemConfigBuilderProps) {
  const [selectedCoreIndex, setSelectedCoreIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"form" | "tree">("form");

  const addCore = () => {
    const newCore: CoreConfig = {
      coreId: `core-${config.cores.length + 1}`,
      name: `CPU Core ${config.cores.length + 1}`,
      color: `hsl(${(config.cores.length * 40) % 360}, 70%, 60%)`,
      queues: [
        {
          queueId: `q1-c${config.cores.length + 1}`,
          name: "Default Queue",
          priority: 0,
          algorithm: "FCFS",
        },
      ],
    };
    onConfigChange({ ...config, cores: [...config.cores, newCore] });
  };

  const removeCore = (coreIndex: number) => {
    if (config.cores.length === 1) return;
    const newCores = config.cores.filter((_, i) => i !== coreIndex);
    onConfigChange({ ...config, cores: newCores });
    if (selectedCoreIndex >= newCores.length) {
      setSelectedCoreIndex(Math.max(0, newCores.length - 1));
    }
  };

  const addQueue = (coreIndex: number) => {
    const core = config.cores[coreIndex];
    const newQueue: QueueConfig = {
      queueId: `q${core.queues.length + 1}-${core.coreId}`,
      name: `Queue ${core.queues.length + 1}`,
      priority: core.queues.length,
      algorithm: "FCFS",
    };
    const newCores = [...config.cores];
    newCores[coreIndex] = {
      ...core,
      queues: [...core.queues, newQueue],
    };
    onConfigChange({ ...config, cores: newCores });
  };

  const removeQueue = (coreIndex: number, queueIndex: number) => {
    const core = config.cores[coreIndex];
    if (core.queues.length === 1) return;
    const newQueues = core.queues.filter((_, i) => i !== queueIndex);
    const newCores = [...config.cores];
    newCores[coreIndex] = { ...core, queues: newQueues };
    onConfigChange({ ...config, cores: newCores });
  };

  const updateQueue = (coreIndex: number, queueIndex: number, updates: Partial<QueueConfig>) => {
    const newCores = [...config.cores];
    newCores[coreIndex].queues[queueIndex] = {
      ...newCores[coreIndex].queues[queueIndex],
      ...updates,
    };
    onConfigChange({ ...config, cores: newCores });
  };

  const updateLoadBalancing = (loadBalancing: SystemScheduleConfig["loadBalancing"]) => {
    onConfigChange({ ...config, loadBalancing });
  };

  return (
    <div className="space-y-6">
      <ConfigurationTemplates onSelectTemplate={(template) => onConfigChange(template)} />

      {/* View Mode Toggle */}
      <Card className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configuration View</h3>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "form" | "tree")}>
            <TabsList>
              <TabsTrigger value="form">
                <Settings className="w-4 h-4 mr-2" />
                Form Editor
              </TabsTrigger>
              <TabsTrigger value="tree">
                <Network className="w-4 h-4 mr-2" />
                Tree View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {viewMode === "tree" ? (
        <SystemConfigTreeView
          config={config}
          onNodeClick={(type, id) => {
            // Switch to form view when node is clicked
            setViewMode("form");
            
            // Find and select the core/queue
            if (type === "core") {
              const coreIndex = config.cores.findIndex((c) => c.coreId === id);
              if (coreIndex !== -1) setSelectedCoreIndex(coreIndex);
            } else if (type === "queue") {
              const coreIndex = config.cores.findIndex((c) =>
                c.queues.some((q) => q.queueId === id)
              );
              if (coreIndex !== -1) setSelectedCoreIndex(coreIndex);
            }
          }}
        />
      ) : (
        <>
          <Card className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            CPU Cores ({config.cores.length})
          </h3>
          <Button onClick={addCore} size="sm" disabled={config.cores.length >= 8}>
            <Plus className="w-4 h-4 mr-2" />
            Add Core
          </Button>
        </div>

        <Tabs value={`core-${selectedCoreIndex}`} onValueChange={(v) => setSelectedCoreIndex(parseInt(v.split("-")[1]))}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${config.cores.length}, 1fr)` }}>
            {config.cores.map((core, index) => (
              <TabsTrigger key={core.coreId} value={`core-${index}`}>
                {core.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.cores.map((core, coreIndex) => (
            <TabsContent key={core.coreId} value={`core-${coreIndex}`} className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  Queues ({core.queues.length})
                </h4>
                <div className="flex gap-2">
                  <Button onClick={() => addQueue(coreIndex)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Queue
                  </Button>
                  {config.cores.length > 1 && (
                    <Button onClick={() => removeCore(coreIndex)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Core
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {core.queues.map((queue, queueIndex) => (
                  <Card key={queue.queueId} className="p-4 bg-card/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Queue Name</Label>
                            <Input
                              value={queue.name}
                              onChange={(e) => updateQueue(coreIndex, queueIndex, { name: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Priority Level</Label>
                            <Input
                              type="number"
                              value={queue.priority}
                              onChange={(e) => updateQueue(coreIndex, queueIndex, { priority: parseInt(e.target.value) || 0 })}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Algorithm</Label>
                            <Select
                              value={queue.algorithm}
                              onValueChange={(value: any) => updateQueue(coreIndex, queueIndex, { algorithm: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FCFS">FCFS</SelectItem>
                                <SelectItem value="SJF">SJF</SelectItem>
                                <SelectItem value="SRTF">SRTF</SelectItem>
                                <SelectItem value="Priority">Priority</SelectItem>
                                <SelectItem value="RoundRobin">Round Robin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {queue.algorithm === "RoundRobin" && (
                            <div>
                              <Label className="text-xs">Time Quantum</Label>
                              <Input
                                type="number"
                                value={queue.quantum || 2}
                                onChange={(e) => updateQueue(coreIndex, queueIndex, { quantum: parseInt(e.target.value) || 2 })}
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {core.queues.length > 1 && (
                        <Button onClick={() => removeQueue(coreIndex, queueIndex)} size="sm" variant="ghost" className="ml-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {config.cores.length > 1 && (
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Load Balancing</h3>
          <div className="space-y-3">
            <Label>Load Balancing Strategy</Label>
            <Select value={config.loadBalancing} onValueChange={(value: any) => updateLoadBalancing(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">Round Robin</SelectItem>
                <SelectItem value="least_loaded">Least Loaded</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="static_assignment">Static (All to Core 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </Card>
        )}
        </>
      )}
    </div>
  );
}
