import { NextResponse } from "next/server";
import { generateAddressResult } from "@/lib/fake-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("q") || "123 Main St, Phoenix, AZ";
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = generateAddressResult(address);

  return NextResponse.json(result);
}
