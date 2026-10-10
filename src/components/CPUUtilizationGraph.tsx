import { ScheduleEvent } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { InlinePlaybackControls } from "./InlinePlaybackControls";

interface CPUUtilizationGraphProps {
  events: ScheduleEvent[];
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onStepBack: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  maxTime: number;
}

export function CPUUtilizationGraph({ 
  events, 
  currentTime,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStepBack,
  speed,
  onSpeedChange,
  maxTime,
}: CPUUtilizationGraphProps) {
  if (events.length === 0) {
    return null;
  }

  const eventMaxTime = Math.max(...events.map((e) => e.endTime));
  const timeUnits = Math.ceil(eventMaxTime);

  // Calculate CPU utilization for each time unit
  const utilization = Array.from({ length: timeUnits }, (_, i) => {
    const hasProcess = events.some(
      (e) => e.startTime <= i && e.endTime > i && e.processId !== "idle"
    );
    return hasProcess ? 1 : 0;
  });

  const maxHeight = 100;

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-xl border-border/50 shadow-lg space-y-4">
      <h4 className="text-lg font-semibold text-primary glow-text">CPU Utilization Over Time</h4>
      
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
      />
      
      <div className="flex items-end gap-1 h-32 p-4 bg-gradient-to-t from-muted/20 to-transparent rounded-lg border border-border/20">
        {utilization.map((value, index) => {
          const isActive = index < currentTime;
          return (
            <motion.div
              key={index}
              className="flex-1 relative group"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: isActive ? `${value * maxHeight}%` : 0,
                opacity: isActive ? 1 : 0.3
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
            >
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  value === 1
                    ? isActive
                      ? "bg-gradient-to-t from-secondary to-secondary/70 shadow-[0_0_15px_rgba(150,255,150,0.5)]"
                      : "bg-muted/20"
                    : "bg-gradient-to-t from-destructive/70 to-destructive/40 shadow-[0_0_10px_rgba(255,100,100,0.3)]"
                }`}
                style={{ height: "100%" }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs font-semibold text-foreground/80 mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded border border-border/30">
                {index}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-secondary to-secondary/70 shadow-[0_0_10px_rgba(150,255,150,0.5)]" />
          <span className="text-xs font-medium text-foreground/70">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-destructive/70 to-destructive/40 shadow-[0_0_8px_rgba(255,100,100,0.3)]" />
          <span className="text-xs font-medium text-foreground/70">Idle</span>
        </div>
      </div>
    </Card>
  );
}
