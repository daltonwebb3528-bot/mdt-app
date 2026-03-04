import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, data, query } = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to template-based summary if no Gemini key
      const summary = generateTemplateSummary(type, data, query);
      return NextResponse.json({ summary });
    }

    const prompt = buildPrompt(type, data, query);

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
      const summary = generateTemplateSummary(type, data, query);
      return NextResponse.json({ summary });
    }

    const result = await response.json();
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text || generateTemplateSummary(type, data, query);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildPrompt(type: string, data: unknown, query?: string): string {
  const baseInstruction = `You are a police dispatch assistant. Generate a brief, spoken summary (2-3 sentences max) for an officer. Be direct and prioritize safety-critical information first. Use natural speech patterns. Do not use bullet points or formatting. Speak as if you're talking on the radio. IMPORTANT: Always start by echoing back exactly what was searched for.`;

  if (type === "person") {
    return `${baseInstruction}

The officer searched for: "${query || 'unknown'}"
Search results:
${JSON.stringify(data, null, 2)}

Generate a voice response that:
1. Starts with the EXACT search query (e.g., "Bob Smith, date of birth 1-1-1980...")
2. Then states warrant status and any flags
3. Keeps it brief and radio-friendly

Example: "Bob Smith, date of birth January 1st 1980, comes back with 2 active warrants. Flagged as armed and dangerous. Use caution."`;
  }

  if (type === "plate") {
    return `${baseInstruction}

The officer searched for plate: "${query || 'unknown'}"
Search results:
${JSON.stringify(data, null, 2)}

Generate a voice response that:
1. Starts with the EXACT plate number searched
2. States if stolen or clear
3. Mentions owner name and any warrants/flags
4. Keeps it brief and radio-friendly

Example: "Plate Alpha Bravo Charlie 1 2 3 comes back clear. Registered to John Smith, no warrants, no flags."`;
  }

  if (type === "phone") {
    return `${baseInstruction}

The officer searched for phone: "${query || 'unknown'}"
Search results:
${JSON.stringify(data, null, 2)}

Generate a voice response that:
1. Starts with the phone number searched
2. States who it's registered to
3. Mentions any prior incidents
4. Keeps it brief

Example: "Phone number 4 8 0, 5 5 5, 1 2 3 4 is registered to Jane Doe at 123 Main Street. No prior incidents."`;
  }

  if (type === "lpr") {
    return `${baseInstruction}

LPR Alert analysis:
${JSON.stringify(data, null, 2)}

Focus on: vehicle status (stolen or clear), owner name, any warrants or flags (armed, dangerous, flight risk). Lead with critical safety info.`;
  }

  if (type === "cad") {
    return `${baseInstruction}

CAD Call analysis:
${JSON.stringify(data, null, 2)}

Focus on: call type, risk level, any residents with warrants or flags, history of violence at location.`;
  }

  return `${baseInstruction}

Search query: "${query || 'unknown'}"
Results:
${JSON.stringify(data, null, 2)}`;
}

function generateTemplateSummary(type: string, data: Record<string, unknown>, query?: string): string {
  if (type === "person") {
    const persons = data.persons as Record<string, unknown>[];
    if (!persons?.length) return `No results found for ${query || "that search"}.`;
    
    const person = persons[0];
    const firstName = person.firstName as string;
    const lastName = person.lastName as string;
    const dob = person.dob as string;
    const warrants = (person.ncicStatus as Record<string, unknown>)?.warrants as unknown[];
    const flags = person.flags as string[];
    
    // Use the original query if available, otherwise use the returned name
    const nameToSpeak = query || `${firstName} ${lastName}`;
    
    let summary = `${nameToSpeak}`;
    
    if (dob) {
      summary += `, date of birth ${dob},`;
    }
    
    if (warrants?.length > 0) {
      summary += ` has ${warrants.length} active warrant${warrants.length > 1 ? 's' : ''}.`;
      if (flags?.length > 0) {
        summary += ` Flagged as ${flags.join(" and ")}.`;
      }
      summary += " Use caution.";
    } else {
      summary += ` comes back clear. No active warrants.`;
      if (flags?.length > 0) {
        summary += ` Note: flagged as ${flags.join(" and ")}.`;
      }
    }
    
    return summary;
  }

  if (type === "plate") {
    const vehicle = data.vehicle as Record<string, unknown>;
    const owner = data.owner as Record<string, unknown>;
    
    if (!vehicle) return `No vehicle found for plate ${query || "that plate"}.`;
    
    const plate = (query || vehicle.plate as string || "unknown").toUpperCase();
    const isStolen = (vehicle.ncicStatus as Record<string, unknown>)?.stolen;
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : "unknown owner";
    const ownerWarrants = ((owner?.ncicStatus as Record<string, unknown>)?.warrants as unknown[]) || [];
    const ownerFlags = (owner?.flags as string[]) || [];
    
    // Spell out plate for clarity
    const plateSpoken = plate.split('').join(' ');
    
    if (isStolen) {
      let summary = `Alert! Plate ${plateSpoken} comes back stolen.`;
      summary += ` Registered to ${ownerName}.`;
      if (ownerWarrants.length > 0) {
        summary += ` Owner has active warrants.`;
      }
      if (ownerFlags.length > 0) {
        summary += ` Flagged as ${ownerFlags.join(" and ")}.`;
      }
      summary += " Request backup before approach.";
      return summary;
    }
    
    let summary = `Plate ${plateSpoken} comes back clear.`;
    summary += ` Registered to ${ownerName}.`;
    
    if (ownerWarrants.length > 0) {
      summary += ` Heads up, owner has ${ownerWarrants.length} active warrant${ownerWarrants.length > 1 ? 's' : ''}.`;
    } else {
      summary += ` No warrants.`;
    }
    
    if (ownerFlags.length > 0) {
      summary += ` Flagged as ${ownerFlags.join(" and ")}.`;
    }
    
    return summary;
  }

  if (type === "phone") {
    const phone = query || data.phone as string || "unknown";
    const registeredName = data.registeredName as string || "unknown";
    const registeredAddress = data.registeredAddress as string || "unknown address";
    const priorIncidents = data.priorIncidents as unknown[] || [];
    
    // Format phone for speaking
    const phoneSpoken = phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1, $2, $3');
    
    let summary = `Phone number ${phoneSpoken} is registered to ${registeredName}`;
    
    if (registeredAddress && registeredAddress !== "unknown address") {
      summary += ` at ${registeredAddress}`;
    }
    summary += ".";
    
    if (priorIncidents.length > 0) {
      summary += ` ${priorIncidents.length} prior incident${priorIncidents.length > 1 ? 's' : ''} on file.`;
    } else {
      summary += " No prior incidents.";
    }
    
    return summary;
  }

  if (type === "lpr") {
    const vehicleStatus = data.vehicleStatus as string;
    const owner = data.owner as Record<string, unknown>;
    const plate = data.plate as string || "unknown";
    const plateSpoken = plate.split('').join(' ');
    
    if (vehicleStatus === "STOLEN") {
      const ownerName = owner?.name || "unknown";
      const warrants = (owner?.warrants as Array<Record<string, string>>) || [];
      const alerts = (owner?.alerts as string[]) || [];
      
      let summary = `Alert! Plate ${plateSpoken} comes back stolen.`;
      
      if (ownerName !== "unknown") {
        summary += ` Registered to ${ownerName}.`;
      }
      
      if (warrants.length > 0) {
        summary += ` Active ${warrants[0].type} warrant.`;
      }
      
      if (alerts.length > 0) {
        summary += ` Flagged as ${alerts.join(" and ")}.`;
      }
      
      summary += " Request backup before approach.";
      return summary;
    }
    
    return `Plate ${plateSpoken} comes back clear. Registered to ${owner?.name || "unknown owner"}. No warrants or alerts.`;
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
      const allFlags = flaggedResidents.flatMap(r => r.flags as string[]);
      if (allFlags.includes("Warrant")) {
        summary += " One resident has an active warrant.";
      }
      if (allFlags.includes("Gang")) {
        summary += " Gang affiliation noted.";
      }
      if (allFlags.includes("Prior DV")) {
        summary += " History of domestic violence.";
      }
    }
    
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      summary += " Use caution on approach.";
    }
    
    return summary;
  }

  return `Search complete for ${query || "your query"}. Check the screen for details.`;
}
