import { ScheduleEvent } from "@/types/scheduling";
import { motion } from "framer-motion";
import { InlinePlaybackControls } from "./InlinePlaybackControls";

interface GanttChartProps {
  events: ScheduleEvent[];
  currentTime?: number;
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

export function GanttChart({ 
  events, 
  currentTime = 0,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStepBack,
  speed,
  onSpeedChange,
  maxTime,
}: GanttChartProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No schedule data yet. Add processes and run the simulation.</p>
      </div>
    );
  }

  const eventMaxTime = Math.max(...events.map((e) => e.endTime));
  const timeScale = 100 / eventMaxTime;
  
  // Get unique processes for legend
  const uniqueProcesses = Array.from(
    new Map(events.map(e => [e.processId, { name: e.processName, color: e.color }])).values()
  );

  // Detect context switches
  const contextSwitchTimes: number[] = [];
  for (let i = 1; i < events.length; i++) {
    if (events[i - 1].processId !== events[i].processId) {
      contextSwitchTimes.push(events[i].startTime);
    }
  }

  // Check if there's a switch happening right now
  const currentSwitchIndex = contextSwitchTimes.findIndex(
    (time) => Math.abs(time - currentTime) < 0.2
  );
  const isSwitchingNow = currentSwitchIndex !== -1;

  return (
    <div className="space-y-4">
      {/* Inline Playback Controls */}
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

      <div className="space-y-6">
      {/* Gantt Chart with labels above */}
      <div className="relative">
        {/* Process labels above blocks */}
        <div className="relative h-8 mb-2">
          {events.map((event, index) => {
            const left = event.startTime * timeScale;
            const width = (event.endTime - event.startTime) * timeScale;
            
            return (
              <div
                key={`label-${event.processId}-${index}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
              >
                <span 
                  className="text-sm font-semibold px-2 py-1 rounded"
                  style={{ color: event.color }}
                >
                  {event.processName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Gantt Chart */}
        <div className="relative h-20 bg-gradient-to-r from-card/60 via-card/40 to-card/60 backdrop-blur-xl rounded-lg border border-border/50 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around text-xs text-muted-foreground">
            <span className="text-center">10</span>
            <span className="text-center">2</span>
            <span className="text-center">4</span>
            <span className="text-center">5</span>
            <span className="text-center">6</span>
            <span className="text-center">1</span>
            <span className="text-center">0</span>
          </div>

          <div className="absolute inset-0 pl-8 flex items-center">
            {events.map((event, index) => {
              const left = event.startTime * timeScale;
              const width = (event.endTime - event.startTime) * timeScale;
              const isActive = event.startTime <= currentTime && event.endTime > currentTime;
              const isSwitchStart = contextSwitchTimes.includes(event.startTime);

              return (
                <motion.div
                  key={`${event.processId}-${index}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ 
                    scaleX: 1, 
                    opacity: 1,
                    scale: isActive && isSwitchingNow ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ 
                    scaleX: { duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.6, delay: index * 0.1 },
                    scale: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="absolute h-14 rounded-lg flex items-center justify-center font-bold text-base border-2 cursor-pointer transition-all duration-300"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: event.color,
                    borderColor: event.color,
                    boxShadow: isActive 
                      ? `0 4px 32px ${event.color}80, 0 0 0 2px ${event.color}40 inset, 0 0 20px ${event.color}`
                      : `0 4px 24px ${event.color}50, 0 0 0 1px ${event.color}20 inset`,
                    originX: 0,
                  }}
                  title={`${event.processName}\nStart: ${event.startTime}\nEnd: ${event.endTime}`}
                >
                  <span className="text-black font-bold drop-shadow-lg text-lg">
                    {event.processName}
                  </span>
                  
                  {/* Switch Indicator at Start */}
                  {isSwitchStart && (
                    <motion.div
                      className="absolute -left-1 top-0 bottom-0 w-1 bg-destructive rounded-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-destructive rounded-full"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scaleX: [1, 2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Active Process Glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2"
                      style={{ borderColor: event.color }}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Context Switch Flash Effects */}
            {contextSwitchTimes.map((switchTime, idx) => {
              const isFlashing = Math.abs(switchTime - currentTime) < 0.3;
              if (!isFlashing) return null;

              return (
                <motion.div
                  key={`switch-flash-${idx}`}
                  className="absolute top-0 bottom-0 w-8 pointer-events-none z-20"
                  style={{
                    left: `${switchTime * timeScale}%`,
                    transform: "translateX(-50%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 2],
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--destructive)) 0%, transparent 70%)",
                      boxShadow: "0 0 40px hsl(var(--destructive))",
                    }}
                  />
                </motion.div>
              );
            })}
            
            {currentTime > 0 && currentTime <= eventMaxTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-0 bottom-0 w-1 z-10 rounded-full"
                style={{
                  left: `${currentTime * timeScale}%`,
                  background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--secondary)))",
                  boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)",
                }}
              />
            )}
          </div>
        </div>

        {/* Timeline scale */}
        <div className="relative h-8 mt-2 pl-8 bg-muted/10 rounded-md border border-border/20">
          <div className="absolute inset-0 flex items-start">
            {Array.from({ length: Math.ceil(eventMaxTime) + 1 }, (_, i) => (
              <div
                key={i}
                className="relative flex-shrink-0"
                style={{ width: `${100 / (Math.ceil(eventMaxTime) + 1)}%` }}
              >
                <div className="absolute left-0 top-0 w-px h-2 bg-primary/30" />
                <span className="absolute left-0 top-3 text-xs font-medium text-foreground/60 transform -translate-x-1/2">
                  {i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-6 pt-2"
      >
        {uniqueProcesses.map((process, index) => (
          <motion.div 
            key={process.name} 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all duration-300"
          >
            <div 
              className="w-3 h-3 rounded-full border-2 transition-transform duration-300"
              style={{ 
                backgroundColor: process.color,
                borderColor: process.color,
                boxShadow: `0 0 10px ${process.color}40`,
              }}
            />
            <span className="text-xs font-semibold" style={{ color: process.color }}>
              {process.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
      </div>
    </div>
  );
}
