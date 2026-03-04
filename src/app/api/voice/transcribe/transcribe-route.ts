import { NextRequest, NextResponse } from "next/server";
import { parseVoiceCommand, normalizeSpokenPlate } from "@/lib/deepgram";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob;
    
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 });
    }

    // Convert blob to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to Deepgram for transcription
    const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "audio/webm",
      },
      body: buffer,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Deepgram error:", error);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const data = await response.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    // Parse the command
    let command = parseVoiceCommand(transcript);
    
    // If it's a plate command, normalize spoken letters/numbers
    if (command.action === "plate") {
      command.query = normalizeSpokenPlate(command.query);
    }

    return NextResponse.json({
      transcript,
      confidence,
      command,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
