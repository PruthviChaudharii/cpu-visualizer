import { ContextSwitch } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

interface ContextSwitchTimelineProps {
  contextSwitches: ContextSwitch[];
  currentTime: number;
  maxTime: number;
}

const CONTEXT_SWITCH_OVERHEAD = 0.1; // 0.1ms per switch

export function ContextSwitchTimeline({
  contextSwitches,
  currentTime,
  maxTime,
}: ContextSwitchTimelineProps) {
  if (contextSwitches.length === 0) {
    return null;
  }

  const timeScale = 800 / maxTime;
  const visibleSwitches = contextSwitches.filter((sw) => sw.time <= currentTime);
  const totalOverhead = contextSwitches.length * CONTEXT_SWITCH_OVERHEAD;

  return (
    <Card className="glass-panel p-6 hover:shadow-elevation transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Context Switch Timeline
        </h3>
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {visibleSwitches.length} Switches
            </span>
          </motion.div>
          <div className="text-xs text-muted-foreground">
            Overhead: {totalOverhead.toFixed(2)}ms
          </div>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative h-20 bg-muted/10 rounded-lg border border-border/20 overflow-hidden">
        {/* Time Scale */}
        <div className="absolute top-0 left-0 right-0 h-6 border-b border-border/20 flex items-center px-2">
          {Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: `${i * timeScale}px` }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Switch Markers */}
        {contextSwitches.map((sw, index) => {
          const isVisible = sw.time <= currentTime;
          const left = sw.time * timeScale;

          return (
            <motion.div
              key={sw.switchNumber}
              className="absolute top-6 bottom-0 group cursor-pointer"
              style={{ left: `${left}px` }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: isVisible ? 1 : 0, scaleY: isVisible ? 1 : 0 }}
              transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
            >
              {/* Vertical Line */}
              <div className="w-0.5 h-full bg-destructive/60 relative">
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-destructive"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleX: [1, 2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              </div>

              {/* Marker Dot */}
              <motion.div
                className="absolute -left-1.5 top-0 w-3 h-3 bg-destructive rounded-full shadow-glow"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />

              {/* Tooltip */}
              <div className="absolute -left-20 -top-16 w-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-popover border border-border rounded-lg shadow-elevation p-2 text-xs">
                  <div className="font-semibold text-foreground mb-1">
                    Switch #{sw.switchNumber}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="font-medium">{sw.fromProcessName}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium">{sw.toProcessName}</span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Time: {sw.time.toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Transition Arrow */}
              <motion.div
                className="absolute -top-2 left-2 opacity-0 group-hover:opacity-100"
                initial={{ x: 0 }}
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4 text-destructive" />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Current Time Indicator */}
        <motion.div
          className="absolute top-6 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${currentTime * timeScale}px` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary rounded-full shadow-glow" />
        </motion.div>
      </div>

      {/* Switch Frequency Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="glass-panel p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Total Switches</div>
          <div className="text-xl font-semibold text-foreground">
            {contextSwitches.length}
          </div>
        </div>
        <div className="glass-panel p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Avg Switch Rate</div>
          <div className="text-xl font-semibold text-foreground">
            {(contextSwitches.length / maxTime).toFixed(2)}/s
          </div>
        </div>
        <div className="glass-panel p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Total Overhead</div>
          <div className="text-xl font-semibold text-destructive">
            {totalOverhead.toFixed(2)}ms
          </div>
        </div>
      </div>
    </Card>
  );
}
