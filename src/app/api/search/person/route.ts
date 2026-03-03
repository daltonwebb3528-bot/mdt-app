import { NextResponse } from "next/server";
import { generatePerson } from "@/lib/fake-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "John Smith";
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate 1-3 results
  const numResults = 1 + Math.floor(Math.random() * 3);
  const persons = [];
  
  for (let i = 0; i < numResults; i++) {
    persons.push(generatePerson(`${query}-${i}`));
  }

  return NextResponse.json({ persons });
}
