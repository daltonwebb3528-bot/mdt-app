import { NextResponse } from "next/server";
import { generateAlert } from "@/lib/fake-data";

// Store alerts in memory (resets on deploy, but that's fine for demo)
let alerts: ReturnType<typeof generateAlert>[] = [];
let alertCounter = 0;

// Generate initial alerts
function initAlerts() {
  if (alerts.length === 0) {
    for (let i = 0; i < 8; i++) {
      alerts.push(generateAlert(`init-${i}`));
    }
  }
}

export async function GET() {
  initAlerts();
  return NextResponse.json(alerts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
}

// Add new alert (can be called to simulate new alerts)
export async function POST() {
  alertCounter++;
  const newAlert = generateAlert(`new-${alertCounter}-${Date.now()}`);
  alerts.unshift(newAlert);
  
  // Keep only last 50 alerts
  if (alerts.length > 50) {
    alerts = alerts.slice(0, 50);
  }
  
  return NextResponse.json(newAlert);
}
