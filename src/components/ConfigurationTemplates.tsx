import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SystemScheduleConfig } from "@/types/advancedScheduling";
import { configTemplates } from "@/utils/systemConfigDefaults";
import { FileStack, Layers, Cpu, Zap } from "lucide-react";

interface ConfigurationTemplatesProps {
  onSelectTemplate: (config: SystemScheduleConfig) => void;
}

export function ConfigurationTemplates({ onSelectTemplate }: ConfigurationTemplatesProps) {
  const templates = [
    {
      name: "Single Core",
      icon: Cpu,
      description: "Basic single CPU with one queue",
      config: configTemplates["Single Core"],
    },
    {
      name: "Multi-Level Feedback Queue",
      icon: Layers,
      description: "3-level queue with auto promotion/demotion",
      config: configTemplates["Multi-Level Feedback Queue"],
    },
    {
      name: "Dual-Core Load Balanced",
      icon: Zap,
      description: "2 CPUs with work stealing",
      config: configTemplates["Dual-Core Load Balanced"],
    },
    {
      name: "Priority Multi-Queue",
      icon: FileStack,
      description: "System, User, and Batch queues",
      config: configTemplates["Priority Multi-Queue"],
    },
  ];

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start Templates</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Button
              key={template.name}
              onClick={() => onSelectTemplate(template.config)}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:bg-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">{template.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
