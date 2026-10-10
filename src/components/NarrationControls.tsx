import { Volume2, VolumeX, Play, Pause, Square, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UseNarrationReturn } from "@/hooks/useNarration";
import { motion } from "framer-motion";

interface NarrationControlsProps {
  narration: UseNarrationReturn;
}

export const NarrationControls = ({ narration }: NarrationControlsProps) => {
  const { settings, isSpeaking, availableVoices, stop, pause, resume, updateSettings, queueLength } = narration;

  return (
    <Card className="glass-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {settings.enabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </motion.div>

          <div className="flex flex-col">
            <span className="text-sm font-medium">Voice Narration</span>
            {isSpeaking && (
              <motion.span
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Speaking... {queueLength > 0 && `(${queueLength} queued)`}
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="narration-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
            <Label htmlFor="narration-enabled" className="text-xs cursor-pointer">
              {settings.enabled ? "On" : "Off"}
            </Label>
          </div>

          {settings.enabled && isSpeaking && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={pause}
                className="h-8 w-8 p-0"
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resume}
                className="h-8 w-8 p-0"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={stop}
                className="h-8 w-8 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-panel" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Voice Settings</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-select" className="text-sm">Voice</Label>
                  <Select
                    value={settings.voice?.name || ""}
                    onValueChange={(voiceName) => {
                      const voice = availableVoices.find(v => v.name === voiceName);
                      if (voice) updateSettings({ voice });
                    }}
                  >
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Speed: {settings.rate.toFixed(1)}x</Label>
                  </div>
                  <Slider
                    value={[settings.rate]}
                    onValueChange={([rate]) => updateSettings({ rate })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Pitch: {settings.pitch.toFixed(1)}</Label>
                  </div>
                  <Slider
                    value={[settings.pitch]}
                    onValueChange={([pitch]) => updateSettings({ pitch })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Volume: {Math.round(settings.volume * 100)}%</Label>
                  </div>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([volume]) => updateSettings({ volume })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="auto-narrate" className="text-sm">Auto-narrate events</Label>
                  <Switch
                    id="auto-narrate"
                    checked={settings.autoNarrate}
                    onCheckedChange={(autoNarrate) => updateSettings({ autoNarrate })}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};
