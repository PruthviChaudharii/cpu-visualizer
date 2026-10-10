import { ProcessTimeline } from "@/types/scheduling";
import { Card } from "@/components/ui/card";
import { InlinePlaybackControls } from "@/components/InlinePlaybackControls";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProcessTimelineViewProps {
  timelines: ProcessTimeline[];
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

const stateColors = {
  NEW: "hsl(200 100% 55%)",
  READY: "hsl(40 100% 55%)",
  RUNNING: "hsl(150 100% 45%)",
  TERMINATED: "hsl(280 80% 60%)",
};

const stateLabels = {
  NEW: "New",
  READY: "Ready",
  RUNNING: "Running",
  TERMINATED: "Terminated",
};

export function ProcessTimelineView({
  timelines,
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
}: ProcessTimelineViewProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{
    processId: string;
    state: string;
    startTime: number;
    endTime: number;
    x: number;
    y: number;
  } | null>(null);

  if (timelines.length === 0) {
    return null;
  }

  const timeScale = 800 / maxTime;
  const laneHeight = 60;

  return (
    <Card className="glass-panel p-6 hover:shadow-elevation transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Process Timeline Animation
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

      <div className="mt-6 space-y-1 overflow-x-auto">
        {/* Mini Timeline Header */}
        <div className="flex items-center mb-4 pb-2 border-b border-border/30">
          <div className="w-24 text-xs font-medium text-muted-foreground">Process</div>
          <div className="flex-1 relative h-6">
            {Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: `${(i * timeScale)}px`, top: 0 }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>

        {/* Process Lanes */}
        {timelines.map((timeline, index) => (
          <motion.div
            key={timeline.processId}
            className="flex items-center py-2 hover:bg-muted/20 rounded-lg transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            {/* Process Label */}
            <div className="w-24 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shadow-glow"
                style={{ backgroundColor: timeline.color }}
              />
              <span className="text-sm font-semibold text-foreground">
                {timeline.processName}
              </span>
            </div>

            {/* Timeline Track */}
            <div className="flex-1 relative" style={{ height: `${laneHeight}px` }}>
              {/* Background Track */}
              <div className="absolute inset-0 bg-muted/10 rounded-lg border border-border/20" />

              {/* State Blocks */}
              {timeline.stateBlocks.map((block, blockIndex) => {
                const width = (block.endTime - block.startTime) * timeScale;
                const left = block.startTime * timeScale;
                const isVisible = block.startTime <= currentTime;
                const currentWidth = isVisible
                  ? Math.min(width, (currentTime - block.startTime) * timeScale)
                  : 0;

                return (
                  <motion.div
                    key={`${block.processId}-${blockIndex}`}
                    className="absolute top-2 bottom-2 rounded-md cursor-pointer overflow-hidden"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      backgroundColor: stateColors[block.state],
                      opacity: 0.9,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.9 }}
                    transition={{
                      delay: blockIndex * 0.1,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredBlock({
                        processId: timeline.processId,
                        state: stateLabels[block.state],
                        startTime: block.startTime,
                        endTime: block.endTime,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredBlock(null)}
                  >
                    {/* Animated Fill */}
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentWidth / width) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />

                    {/* State Label */}
                    {width > 40 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-background mix-blend-difference">
                          {stateLabels[block.state]}
                        </span>
                      </div>
                    )}

                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 border-2 rounded-md"
                      style={{
                        borderColor: stateColors[block.state],
                        boxShadow: `0 0 10px ${stateColors[block.state]}`,
                      }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                );
              })}

              {/* Current Time Cursor */}
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-glow z-10"
                style={{ left: `${currentTime * timeScale}px` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="absolute -top-2 -left-1.5 w-3 h-3 bg-primary rounded-full shadow-glow" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs">
        {Object.entries(stateLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: stateColors[key as keyof typeof stateColors] }}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredBlock && (
          <motion.div
            className="fixed z-50 px-3 py-2 bg-popover border border-border rounded-lg shadow-elevation text-xs"
            style={{
              left: hoveredBlock.x,
              top: hoveredBlock.y - 10,
              transform: "translate(-50%, -100%)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="font-semibold text-foreground mb-1">{hoveredBlock.state}</div>
            <div className="text-muted-foreground">
              Time: {hoveredBlock.startTime.toFixed(1)} - {hoveredBlock.endTime.toFixed(1)}
            </div>
            <div className="text-muted-foreground">
              Duration: {(hoveredBlock.endTime - hoveredBlock.startTime).toFixed(1)}s
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
