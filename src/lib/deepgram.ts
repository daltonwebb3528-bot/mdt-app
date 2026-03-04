// Deepgram API utilities for STT and TTS

export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

export interface VoiceCommand {
  action: "plate" | "person" | "phone" | "address" | "read" | "analysis" | "unknown";
  query: string;
  raw: string;
}

// Parse natural language into a command
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const text = transcript.toLowerCase().trim();
  
  // Run analysis commands - check these first
  const analysisPatterns = [
    /run\s*(?:the\s*)?analysis/i,
    /run\s*(?:the\s*)?ncic/i,
    /analyze\s*(?:this|the|it)?/i,
    /start\s*analysis/i,
    /do\s*(?:the\s*)?analysis/i,
    /get\s*(?:the\s*)?analysis/i,
    /check\s*(?:the\s*)?ncic/i,
    /pull\s*(?:the\s*)?ncic/i,
  ];
  
  for (const pattern of analysisPatterns) {
    if (pattern.test(text)) {
      return { action: "analysis", query: "", raw: transcript };
    }
  }
  
  // Plate commands
  const platePatterns = [
    /(?:run|check|search|look up|lookup|find)\s*(?:plate|license|tag|vehicle)\s*(.+)/i,
    /(?:plate|license|tag)\s*(.+)/i,
  ];
  
  for (const pattern of platePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up the plate - remove spaces, convert to uppercase
      const plate = match[1]
        .replace(/\s+/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      return { action: "plate", query: plate, raw: transcript };
    }
  }
  
  // Person commands
  const personPatterns = [
    /(?:run|check|search|look up|lookup|find)\s*(?:person|name|subject|individual)\s*(.+)/i,
    /(?:who is|lookup|look up)\s*(.+)/i,
    /(?:check|run)\s*(?:a\s*)?(?:name\s*)?([a-z]+\s+[a-z]+)/i,
  ];
  
  for (const pattern of personPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { action: "person", query: match[1].trim(), raw: transcript };
    }
  }
  
  // Phone commands
  const phonePatterns = [
    /(?:run|check|search|look up|lookup|find)\s*(?:phone|number|cell|mobile)\s*(.+)/i,
    /(?:phone|call)\s*(.+)/i,
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up phone number
      const phone = match[1].replace(/[^0-9]/g, "");
      return { action: "phone", query: phone, raw: transcript };
    }
  }
  
  // Address commands
  const addressPatterns = [
    /(?:run|check|search|look up|lookup|find)\s*(?:address|location)\s*(.+)/i,
    /(?:address)\s*(.+)/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { action: "address", query: match[1].trim(), raw: transcript };
    }
  }
  
  // Read/speak commands
  const readPatterns = [
    /(?:read|speak|say|tell me)\s*(?:the\s*)?(?:analysis|summary|results|details)/i,
    /(?:what do we have|what's the info|give me the rundown)/i,
    /(?:read it back|summarize)/i,
  ];
  
  for (const pattern of readPatterns) {
    if (pattern.test(text)) {
      return { action: "read", query: "", raw: transcript };
    }
  }
  
  return { action: "unknown", query: text, raw: transcript };
}

// Convert spoken numbers/letters to plate format
export function normalizeSpokenPlate(spoken: string): string {
  const replacements: Record<string, string> = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
    "alpha": "A", "bravo": "B", "charlie": "C", "delta": "D", "echo": "E",
    "foxtrot": "F", "golf": "G", "hotel": "H", "india": "I", "juliet": "J",
    "kilo": "K", "lima": "L", "mike": "M", "november": "N", "oscar": "O",
    "papa": "P", "quebec": "Q", "romeo": "R", "sierra": "S", "tango": "T",
    "uniform": "U", "victor": "V", "whiskey": "W", "xray": "X", "yankee": "Y",
    "zulu": "Z",
  };
  
  let result = spoken.toLowerCase();
  
  for (const [word, char] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\b${word}\\b`, "gi"), char);
  }
  
  return result.replace(/\s+/g, "").toUpperCase();
}
