"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface IWindow extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

interface VoiceCommand {
  action: "plate" | "person" | "phone" | "address" | "read" | "unknown";
  query: string;
  raw: string;
}

interface VoiceControlProps {
  onCommand: (command: VoiceCommand) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export function VoiceControl({ onCommand, onListeningChange }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeWordRecognitionRef = useRef<ISpeechRecognition | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      setStatus("Listening...");

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 5000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      setStatus("Mic access denied");
      setIsWakeWordActive(false);
    }
  }, [onListeningChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    onListeningChange?.(false);
    setIsWakeWordActive(false);
  }, [onListeningChange]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatus("Processing...");

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
      
      if (data.command) {
        setStatus(`Got it: ${data.command.action}`);
        onCommand(data.command);
      } else {
        setStatus("Didn't catch that");
      }
    } catch (error) {
      console.error("Processing error:", error);
      setStatus("Error processing");
    } finally {
      setIsProcessing(false);
      
      setTimeout(() => {
        setStatus("");
        if (wakeWordEnabled && wakeWordRecognitionRef.current) {
          try {
            wakeWordRecognitionRef.current.start();
          } catch {
            // Already running
          }
        }
      }, 2000);
    }
  };

  // Initialize wake word detection using Web Speech API
  useEffect(() => {
    if (!wakeWordEnabled) return;
    
    const windowWithSpeech = window as IWindow;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      if (transcript.includes("hey flocky") || transcript.includes("hey blocky") || transcript.includes("hey flock")) {
        setIsWakeWordActive(true);
        setStatus("Listening...");
        recognition.stop();
        startRecording();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech") {
        console.error("Wake word error:", event.error);
      }
    };

    recognition.onend = () => {
      if (wakeWordEnabled && !isListening && !isWakeWordActive) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    wakeWordRecognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start wake word detection:", e);
    }

    return () => {
      recognition.stop();
    };
  }, [wakeWordEnabled, isListening, isWakeWordActive, startRecording]);

  const handleMicClick = () => {
    if (isListening) {
      stopRecording();
    } else {
      wakeWordRecognitionRef.current?.stop();
      startRecording();
    }
  };

  const toggleWakeWord = () => {
    setWakeWordEnabled(!wakeWordEnabled);
    if (wakeWordEnabled) {
      wakeWordRecognitionRef.current?.stop();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Wake word toggle */}
      <button
        onClick={toggleWakeWord}
        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
          wakeWordEnabled
            ? "bg-[#337f6c]/20 text-[#337f6c] border border-[#337f6c]"
            : "bg-[#414f64] text-[#64748b] border border-[#2d3548]"
        }`}
        title={wakeWordEnabled ? 'Say "Hey Flocky" to activate' : "Wake word disabled"}
      >
        {wakeWordEnabled ? "🎤 Hey Flocky" : "🎤 Off"}
      </button>

      {/* Mic button */}
      <button
        onClick={handleMicClick}
        disabled={isProcessing}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? "bg-[#ef4444] animate-pulse"
            : isProcessing
            ? "bg-[#414f64]"
            : "bg-[#337f6c] hover:bg-[#337f6c]/80"
        }`}
        title={isListening ? "Stop listening" : "Start voice command"}
      >
        {isProcessing ? (
          <svg className="w-6 h-6 animate-spin text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : isListening ? (
          <span className="text-white text-xl">⏹</span>
        ) : (
          <span className="text-white text-xl">🎤</span>
        )}
      </button>

      {/* Status indicator */}
      {status && (
        <span className="text-sm text-[#64748b] min-w-[100px]">{status}</span>
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

// Generate and speak a summary
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
