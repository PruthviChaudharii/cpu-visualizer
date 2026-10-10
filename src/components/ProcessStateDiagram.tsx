import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Process } from "@/types/scheduling";
import { ArrowRight } from "lucide-react";
import { InlinePlaybackControls } from "./InlinePlaybackControls";
import { motion } from "framer-motion";

interface ProcessStateDiagramProps {
  processes: Process[];
  runningProcess: Process | null;
  readyQueue: Process[];
  completedProcessIds: string[];
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

const ProcessStateDiagramComponent = ({
  processes,
  runningProcess,
  readyQueue,
  completedProcessIds,
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
}: ProcessStateDiagramProps) => {
  // NEW: Processes that haven't arrived yet
  const newProcesses = processes.filter(
    (p) => p.arrivalTime > currentTime && !completedProcessIds.includes(p.id)
  );

  const terminated = processes.filter((p) => completedProcessIds.includes(p.id));

  const StateBox = ({ 
    title, 
    processes, 
    color, 
    isRunning = false 
  }: { 
    title: string; 
    processes: Process[]; 
    color: string;
    isRunning?: boolean;
  }) => (
    <div className="flex-1 min-w-[180px]">
      <div 
        className="text-sm font-semibold mb-2 text-center"
        style={{ color }}
      >
        {title}
      </div>
      <Card 
        className={`p-4 min-h-[120px] border-2 transition-all duration-500 backdrop-blur-sm ${
          isRunning ? 'animate-glow' : ''
        }`}
        style={{ 
          borderColor: color,
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          boxShadow: isRunning ? `0 0 30px ${color}50, 0 0 60px ${color}20` : `0 4px 12px ${color}10`
        }}
      >
        {processes.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs h-full flex items-center justify-center">
            Empty
          </div>
        ) : (
          <div className="space-y-2">
            {processes.map((process, idx) => (
              <motion.div
                key={process.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, x: 5 }}
                className="p-2.5 rounded-lg border-2 bg-gradient-to-r from-card/70 to-card/50 backdrop-blur-sm text-xs font-semibold flex items-center justify-between transition-all duration-300 cursor-pointer"
                style={{ 
                  borderColor: process.color,
                  boxShadow: `0 0 15px ${process.color}40, 0 2px 8px ${process.color}20`
                }}
              >
                <span style={{ color: process.color }}>{process.name}</span>
                {process.remainingTime < process.burstTime && (
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {process.remainingTime}/{process.burstTime}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-xl border-border/50 shadow-lg space-y-4">
      <h3 className="text-lg font-semibold text-primary glow-text">
        Process State Diagram
      </h3>
      
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
      
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <StateBox 
          title="NEW" 
          processes={newProcesses}
          color="hsl(200 100% 55%)"
        />
        
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowRight className="text-primary/50 flex-shrink-0" />
        </motion.div>
        
        <StateBox 
          title="READY" 
          processes={readyQueue}
          color="hsl(40 100% 55%)"
        />
        
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        >
          <ArrowRight className="text-primary/50 flex-shrink-0" />
        </motion.div>
        
        <StateBox 
          title="RUNNING" 
          processes={runningProcess ? [runningProcess] : []}
          color="hsl(150 100% 45%)"
          isRunning={!!runningProcess}
        />
        
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
        >
          <ArrowRight className="text-primary/50 flex-shrink-0" />
        </motion.div>
        
        <StateBox 
          title="TERMINATED" 
          processes={terminated}
          color="hsl(280 80% 60%)"
        />
      </div>
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProcessStateDiagram = memo(ProcessStateDiagramComponent, (prev, next) => {
  // Only re-render if the actual process IDs in each state change
  const prevRunningId = prev.runningProcess?.id;
  const nextRunningId = next.runningProcess?.id;
  
  const prevReadyIds = prev.readyQueue.map(p => p.id).sort().join(',');
  const nextReadyIds = next.readyQueue.map(p => p.id).sort().join(',');
  
  const prevCompletedIds = prev.completedProcessIds.sort().join(',');
  const nextCompletedIds = next.completedProcessIds.sort().join(',');
  
  // Round time to reduce re-renders
  const prevTime = Math.floor(prev.currentTime);
  const nextTime = Math.floor(next.currentTime);
  
  return (
    prevRunningId === nextRunningId &&
    prevReadyIds === nextReadyIds &&
    prevCompletedIds === nextCompletedIds &&
    prevTime === nextTime
  );
});
