import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

interface NarrationSubtitlesProps {
  isActive: boolean;
  currentText: string;
}

export const NarrationSubtitles = ({ isActive, currentText }: NarrationSubtitlesProps) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (currentText) {
      setDisplayText(currentText);
    }
  }, [currentText]);

  return (
    <AnimatePresence>
      {isActive && displayText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4"
        >
          <Card className="glass-panel p-4 border-primary/20">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Volume2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              </motion.div>
              <div className="flex-1">
                <motion.p
                  className="text-sm leading-relaxed text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayText}
                </motion.p>
              </div>
            </div>
            
            {/* Animated sound wave bars */}
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{
                    height: [8, 20, 8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
