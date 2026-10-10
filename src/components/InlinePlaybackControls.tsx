import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface InlinePlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onStepBack: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentTime: number;
  maxTime: number;
  disabled?: boolean;
}

export function InlinePlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStepBack,
  speed,
  onSpeedChange,
  currentTime,
  maxTime,
  disabled = false,
}: InlinePlaybackControlsProps) {
  const speeds = [0.5, 1, 2, 4];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-xl border border-border/50 shadow-lg"
    >
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-1.5">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onStepBack}
            variant="ghost"
            size="sm"
            disabled={disabled || isPlaying || currentTime === 0}
            className="h-8 w-8 p-0 hover:bg-secondary/10 hover:text-secondary transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.08 }} 
          whileTap={{ scale: 0.92 }}
          className="relative"
        >
          <Button
            onClick={isPlaying ? onPause : onPlay}
            variant="default"
            size="sm"
            disabled={disabled}
            className="h-9 w-9 p-0 bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary hover:via-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 border-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onStep}
            variant="ghost"
            size="sm"
            disabled={disabled || isPlaying || currentTime >= maxTime}
            className="h-8 w-8 p-0 hover:bg-secondary/10 hover:text-secondary transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Center: Time Display */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 backdrop-blur-sm border border-border/30">
        <span className="text-xs font-medium text-muted-foreground">Time:</span>
        <span className="text-sm font-mono font-bold text-primary glow-text">
          {currentTime.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-sm font-mono text-foreground/70">
          {maxTime.toFixed(1)}
        </span>
      </div>

      {/* Right: Speed Controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground mr-1">Speed:</span>
        {speeds.map((s) => (
          <motion.div 
            key={s}
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={() => onSpeedChange(s)}
              variant={speed === s ? "default" : "ghost"}
              size="sm"
              disabled={disabled}
              className={`h-7 w-10 p-0 text-xs font-semibold transition-all duration-300 ${
                speed === s
                  ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-[0_0_15px_rgba(150,255,150,0.4)] hover:shadow-[0_0_20px_rgba(150,255,150,0.5)]"
                  : "hover:bg-accent/10 hover:text-accent"
              }`}
            >
              {s}x
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
