import { useState, useEffect, useCallback, useRef } from "react";

export interface NarrationSettings {
  enabled: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  autoNarrate: boolean;
}

export interface UseNarrationReturn {
  settings: NarrationSettings;
  isSpeaking: boolean;
  availableVoices: SpeechSynthesisVoice[];
  speak: (text: string, priority?: "high" | "normal" | "low") => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  updateSettings: (updates: Partial<NarrationSettings>) => void;
  queueLength: number;
}

const STORAGE_KEY = "cpu-scheduler-narration-settings";

export const useNarration = (): UseNarrationReturn => {
  const [settings, setSettings] = useState<NarrationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          voice: null, // Will be set when voices load
        };
      } catch {
        // Fallback to defaults
      }
    }
    return {
      enabled: false,
      voice: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      autoNarrate: true,
    };
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [queueLength, setQueueLength] = useState(0);
  
  const utteranceQueueRef = useRef<{ text: string; priority: "high" | "normal" | "low" }[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingRef = useRef(false);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select a good default voice if none is set
      if (!settings.voice && voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
        setSettings(prev => ({ ...prev, voice: englishVoice }));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const toSave = {
      enabled: settings.enabled,
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume,
      autoNarrate: settings.autoNarrate,
      voiceName: settings.voice?.name,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [settings]);

  // Process queue
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || utteranceQueueRef.current.length === 0 || !settings.enabled) {
      return;
    }

    isProcessingRef.current = true;
    const nextItem = utteranceQueueRef.current.shift();
    setQueueLength(utteranceQueueRef.current.length);

    if (!nextItem) {
      isProcessingRef.current = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(nextItem.text);
    
    if (settings.voice) {
      utterance.voice = settings.voice;
    }
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentUtteranceRef.current = utterance;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
      processQueue();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, [settings]);

  const speak = useCallback((text: string, priority: "high" | "normal" | "low" = "normal") => {
    if (!settings.enabled) return;

    // Add to queue based on priority
    if (priority === "high") {
      utteranceQueueRef.current.unshift({ text, priority });
    } else {
      utteranceQueueRef.current.push({ text, priority });
    }
    
    setQueueLength(utteranceQueueRef.current.length);
    processQueue();
  }, [settings.enabled, processQueue]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceQueueRef.current = [];
    setQueueLength(0);
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
    isProcessingRef.current = false;
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  const updateSettings = useCallback((updates: Partial<NarrationSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // If voice name is provided, find the matching voice
      if ('voiceName' in updates && typeof updates.voiceName === 'string') {
        const voice = availableVoices.find(v => v.name === updates.voiceName);
        if (voice) {
          newSettings.voice = voice;
        }
      }
      
      return newSettings;
    });
  }, [availableVoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    settings,
    isSpeaking,
    availableVoices,
    speak,
    stop,
    pause,
    resume,
    updateSettings,
    queueLength,
  };
};
