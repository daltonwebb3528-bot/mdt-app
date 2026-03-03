import { NextResponse } from "next/server";
import { generateVehicle, generateLprHistory } from "@/lib/fake-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = (searchParams.get("q") || "ABC1234").toUpperCase();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const { vehicle, owner } = generateVehicle(plate);
  const lprHistory = generateLprHistory(plate, 8);
  
  const aiSummary = vehicle.ncicStatus.stolen 
    ? `⚠️ STOLEN VEHICLE - Reported ${vehicle.ncicStatus.stolenDate}. Case #${vehicle.ncicStatus.caseNumber}. Owner ${owner.firstName} ${owner.lastName}${owner.ncicStatus.warrants.length > 0 ? " has active warrants" : ""}.`
    : `Vehicle registered to ${owner.firstName} ${owner.lastName}. ${owner.ncicStatus.warrants.length > 0 ? "⚠️ Owner has active warrants." : "No flags on file."} ${lprHistory.length} LPR reads in system.`;

  return NextResponse.json({
    vehicle,
    owner,
    lprHistory,
    aiSummary,
  });
}
