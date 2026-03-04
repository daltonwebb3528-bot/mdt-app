"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Define SpeechRecognition types inline to avoid TypeScript errors
interface ISpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceCommand {
  action: "plate" | "person" | "phone" | "address" | "read" | "analysis" | "unknown";
  query: string;
  raw: string;
}

interface VoiceControlProps {
  onCommand: (command: VoiceCommand) => void;
  onListeningChange?: (isListening: boolean) => void;
}

// Global event for triggering analysis from voice
export const voiceEvents = {
  listeners: [] as Array<(command: string) => void>,
  emit(command: string) {
    this.listeners.forEach(fn => fn(command));
  },
  on(fn: (command: string) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
};

export function VoiceControl({ onCommand, onListeningChange }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wakeWordMode, setWakeWordMode] = useState(false);
  const [status, setStatus] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const wakeWordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Stop wake word listening while recording
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsListening(true);
      onListeningChange?.(true);
      setStatus("🔴 Listening...");

      // Auto-stop after 6 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 6000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      setStatus("❌ Mic access denied");
      restartWakeWord();
    }
  }, [onListeningChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    onListeningChange?.(false);
  }, [onListeningChange]);

  const restartWakeWord = useCallback(() => {
    if (wakeWordMode && recognitionRef.current) {
      wakeWordTimeoutRef.current = setTimeout(() => {
        try {
          recognitionRef.current?.start();
          setStatus("🎤 Say 'Hey Flocky'");
        } catch {}
      }, 500);
    }
  }, [wakeWordMode]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatus("⏳ Processing...");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      
      if (data.command && data.command.action !== "unknown") {
        setStatus(`✓ ${data.command.action}: ${data.command.query || "triggered"}`);
        
        // Handle analysis command specially - emit event for alert components
        if (data.command.action === "analysis") {
          voiceEvents.emit("run-analysis");
        }
        
        onCommand(data.command);
      } else if (data.transcript) {
        setStatus(`? "${data.transcript.slice(0, 30)}..."`);
      } else {
        setStatus("Didn't catch that");
      }
    } catch (error) {
      console.error("Processing error:", error);
      setStatus("❌ Error");
    } finally {
      setIsProcessing(false);
      
      // Return to wake word mode after a delay
      setTimeout(() => {
        if (wakeWordMode) {
          restartWakeWord();
        } else {
          setStatus("");
        }
      }, 3000);
    }
  };

  // Wake word listener
  useEffect(() => {
    if (!wakeWordMode) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      setStatus("");
      return;
    }

    // Get SpeechRecognition constructor
    const windowAny = window as Window & { 
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    
    const SpeechRecognitionClass = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setStatus("Speech not supported");
      setWakeWordMode(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      // Check for wake word variations
      if (
        transcript.includes("hey flocky") || 
        transcript.includes("hey blocky") || 
        transcript.includes("hey flock") ||
        transcript.includes("a flocky") ||
        transcript.includes("hey rocky") ||
        transcript.includes("hey flockey")
      ) {
        setStatus("🎤 Command?");
        try { recognition.stop(); } catch {}
        startRecording();
      }
    };

    recognition.onerror = () => {
      // Silently handle errors
    };

    recognition.onend = () => {
      // Only restart if still in wake word mode and not recording/processing
      if (wakeWordMode && !isListening && !isProcessing) {
        wakeWordTimeoutRef.current = setTimeout(() => {
          if (wakeWordMode && recognitionRef.current && !isListening && !isProcessing) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setStatus("🎤 Say 'Hey Flocky'");
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }

    return () => {
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
      try { recognition.stop(); } catch {}
    };
  }, [wakeWordMode, isListening, isProcessing, startRecording]);

  const handleMicClick = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleWakeWord = () => {
    setWakeWordMode(prev => !prev);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Wake word toggle */}
      <button
        onClick={toggleWakeWord}
        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
          wakeWordMode
            ? "bg-[#337f6c] text-white"
            : "bg-[#414f64] text-[#94a3b8] border border-[#2d3548] hover:bg-[#4a5568]"
        }`}
        title={wakeWordMode ? 'Listening for "Hey Flocky"' : "Click to enable wake word"}
      >
        {wakeWordMode ? "🎤 Hey Flocky: ON" : "🎤 Hey Flocky: OFF"}
      </button>

      {/* Manual mic button */}
      <button
        onClick={handleMicClick}
        disabled={isProcessing}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isListening
            ? "bg-[#ef4444] animate-pulse scale-110"
            : isProcessing
            ? "bg-[#414f64] cursor-wait"
            : "bg-[#337f6c] hover:bg-[#2d6b5a] hover:scale-105"
        }`}
        title={isListening ? "Click to stop" : "Click to speak command"}
      >
        {isProcessing ? (
          <svg className="w-6 h-6 animate-spin text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isListening ? (
          <span className="text-white text-2xl">⏹</span>
        ) : (
          <span className="text-white text-2xl">🎤</span>
        )}
      </button>

      {/* Status indicator */}
      {status && (
        <span className="text-sm text-[#94a3b8] min-w-[120px]">{status}</span>
      )}
    </div>
  );
}

// Speech synthesis for reading summaries
export async function speakText(text: string): Promise<void> {
  try {
    const response = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("TTS failed");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  } catch (error) {
    console.error("Speech error:", error);
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}

// Generate and speak a summary for alerts/searches
export async function speakSummary(type: string, data: unknown): Promise<void> {
  try {
    const response = await fetch("/api/voice/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      throw new Error("Summary generation failed");
    }

    const { summary } = await response.json();
    await speakText(summary);
  } catch (error) {
    console.error("Summary error:", error);
  }
}
