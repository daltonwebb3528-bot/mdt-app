import { NextResponse } from "next/server";
import { generatePhoneResult } from "@/lib/fake-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("q") || "4805551234";
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = generatePhoneResult(phone.replace(/\D/g, ""));

  return NextResponse.json(result);
}
