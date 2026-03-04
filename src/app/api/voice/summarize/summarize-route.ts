import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to template-based summary if no Gemini key
      const summary = generateTemplateSummary(type, data);
      return NextResponse.json({ summary });
    }

    const prompt = buildPrompt(type, data);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini error:", error);
      // Fallback to template
      const summary = generateTemplateSummary(type, data);
      return NextResponse.json({ summary });
    }

    const result = await response.json();
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text || generateTemplateSummary(type, data);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildPrompt(type: string, data: unknown): string {
  const baseInstruction = `You are a police dispatch assistant. Generate a brief, spoken summary (2-3 sentences max) for an officer. Be direct and prioritize safety-critical information first. Use natural speech patterns. Do not use bullet points or formatting.`;

  if (type === "plate") {
    return `${baseInstruction}

Summarize this vehicle/plate search result for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: stolen status, warrants, owner alerts, flags. If there are safety concerns, lead with those.`;
  }

  if (type === "person") {
    return `${baseInstruction}

Summarize this person search result for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: active warrants, flags (armed/dangerous, violence history), alerts. Lead with safety concerns.`;
  }

  if (type === "phone") {
    return `${baseInstruction}

Summarize this phone search result for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: registered owner, prior incidents, any red flags.`;
  }

  if (type === "address") {
    return `${baseInstruction}

Summarize this address search result for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: officer safety alerts, prior calls, known residents with warrants.`;
  }

  return `${baseInstruction}

Summarize this information for voice readback:
${JSON.stringify(data, null, 2)}`;
}

function generateTemplateSummary(type: string, data: Record<string, unknown>): string {
  if (type === "plate") {
    const vehicle = data.vehicle as Record<string, unknown> | null;
    const owner = data.owner as Record<string, unknown> | null;
    
    if (!vehicle) return "No vehicle found for that plate.";
    
    const isStolen = (vehicle.ncicStatus as Record<string, unknown>)?.stolen;
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : "unknown owner";
    const hasWarrant = ((owner?.ncicStatus as Record<string, unknown>)?.warrants as unknown[])?.length > 0;
    
    if (isStolen) {
      return `Alert! This vehicle comes back stolen. Registered to ${ownerName}. Proceed with caution and request backup.`;
    }
    
    if (hasWarrant) {
      return `Heads up, the registered owner ${ownerName} has active warrants. Vehicle is a ${vehicle.year} ${vehicle.color} ${vehicle.make} ${vehicle.model}.`;
    }
    
    return `Vehicle comes back clear. ${vehicle.year} ${vehicle.color} ${vehicle.make} ${vehicle.model}, registered to ${ownerName}. No warrants or alerts.`;
  }

  if (type === "person") {
    const persons = data.persons as Record<string, unknown>[];
    if (!persons?.length) return "No matching persons found.";
    
    const person = persons[0];
    const name = `${person.firstName} ${person.lastName}`;
    const warrants = (person.ncicStatus as Record<string, unknown>)?.warrants as unknown[];
    const flags = person.flags as string[];
    
    if (warrants?.length > 0) {
      const warningFlags = flags?.length > 0 ? `Flagged as ${flags.join(", ")}.` : "";
      return `Warning! ${name} has active warrants. ${warningFlags} Proceed with caution.`;
    }
    
    return `${name} comes back clear. No active warrants or alerts.`;
  }

  return "Search complete. Check the screen for details.";
}
