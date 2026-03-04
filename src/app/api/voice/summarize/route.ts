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
            maxOutputTokens: 200,
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
  const baseInstruction = `You are a police dispatch assistant. Generate a brief, spoken summary (2-3 sentences max) for an officer. Be direct and prioritize safety-critical information first. Use natural speech patterns. Do not use bullet points or formatting. Speak as if you're talking on the radio.`;

  if (type === "lpr") {
    return `${baseInstruction}

Summarize this LPR (License Plate Reader) hit for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: vehicle status (stolen or clear), owner name, any warrants or flags (armed, dangerous, flight risk). Lead with critical safety info. Example: "Heads up, this plate comes back stolen. Registered owner is John Smith with an active felony warrant. He's flagged as armed and dangerous."`;
  }

  if (type === "cad") {
    return `${baseInstruction}

Summarize this CAD (Computer Aided Dispatch) call analysis for voice readback to an officer:
${JSON.stringify(data, null, 2)}

Focus on: call type, risk level, any residents with warrants or flags, history of violence at location. Example: "This is a domestic at 123 Main. High risk location with 12 prior calls. One resident has an active warrant and gang affiliation. Use caution on approach."`;
  }

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

  return `${baseInstruction}

Summarize this information for voice readback:
${JSON.stringify(data, null, 2)}`;
}

function generateTemplateSummary(type: string, data: Record<string, unknown>): string {
  if (type === "lpr") {
    const vehicleStatus = data.vehicleStatus as string;
    const owner = data.owner as Record<string, unknown>;
    const plate = data.plate as string;
    
    if (vehicleStatus === "STOLEN") {
      const ownerName = owner?.name || "unknown";
      const warrants = (owner?.warrants as Array<Record<string, string>>) || [];
      const alerts = (owner?.alerts as string[]) || [];
      
      let summary = `Alert! Plate ${plate} comes back stolen.`;
      
      if (ownerName !== "unknown") {
        summary += ` Registered to ${ownerName}.`;
      }
      
      if (warrants.length > 0) {
        summary += ` Active ${warrants[0].type} warrant for ${warrants[0].desc}.`;
      }
      
      if (alerts.length > 0) {
        summary += ` Flagged as ${alerts.join(" and ")}.`;
      }
      
      summary += " Request backup before approach.";
      return summary;
    }
    
    return `Plate ${plate} comes back clear. Registered to ${owner?.name || "unknown owner"}. No warrants or alerts.`;
  }

  if (type === "cad") {
    const callType = data.callType as string;
    const location = data.location as string;
    const riskLevel = data.riskLevel as string;
    const priorCalls = data.priorCalls as number;
    const highActivity = data.highActivity as boolean;
    const residents = data.residents as Array<Record<string, unknown>> || [];
    
    let summary = `${callType} at ${location}.`;
    
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      summary += ` ${riskLevel} risk.`;
    }
    
    if (highActivity && priorCalls > 5) {
      summary += ` High activity location with ${priorCalls} prior calls this year.`;
    }
    
    const flaggedResidents = residents.filter(r => ((r.flags as string[]) || []).length > 0);
    if (flaggedResidents.length > 0) {
      const flags = flaggedResidents.flatMap(r => r.flags as string[]);
      if (flags.includes("Warrant")) {
        summary += " One resident has an active warrant.";
      }
      if (flags.includes("Gang")) {
        summary += " Gang affiliation noted.";
      }
      if (flags.includes("Prior DV")) {
        summary += " History of domestic violence.";
      }
    }
    
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      summary += " Use caution on approach.";
    }
    
    return summary;
  }

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

  return "Analysis complete. Check the screen for details.";
}
