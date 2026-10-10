import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu, Play, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="max-w-4xl w-full mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Cpu className="h-16 w-16 text-primary animate-glow" />
            <h1 className="text-6xl md:text-7xl font-bold glow-text">
              AlgoVista
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Visualize CPU Scheduling Algorithms in Real-Time
          </p>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-8 bg-card/30 backdrop-blur border-border glow-border">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary">
                What is AlgoVista?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                AlgoVista is an interactive visualization tool designed to help you understand
                how different CPU scheduling algorithms work. Watch processes flow through
                different states, compare algorithm performance, and gain insights into
                operating system scheduling strategies.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Play className="h-8 w-8 text-secondary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Interactive Simulation</h3>
                  <p className="text-sm text-muted-foreground">
                    Control playback speed and step through simulations frame-by-frame
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <BarChart3 className="h-8 w-8 text-secondary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Compare Algorithms</h3>
                  <p className="text-sm text-muted-foreground">
                    View multiple algorithms side-by-side to compare performance metrics
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Zap className="h-8 w-8 text-secondary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">Real-Time Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track wait time, turnaround time, CPU utilization, and more
                  </p>
                </div>
              </div>

              {/* Supported Algorithms */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Supported Algorithms:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["FCFS", "SJF", "SRTF", "Round Robin", "Priority", "Priority Preemptive"].map((algo) => (
                    <span
                      key={algo}
                      className="px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/50 text-sm"
                    >
                      {algo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate("/simulation")}
            size="lg"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xl py-8 px-12 rounded-xl shadow-lg hover:shadow-secondary/50 transition-all"
          >
            <Play className="mr-3 h-6 w-6" />
            Run Simulation
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
