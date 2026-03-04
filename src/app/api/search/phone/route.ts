import { NextResponse } from "next/server";
import { generatePersonWithName } from "@/lib/fake-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "John Smith";
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Parse the name from query
  const nameParts = query.trim().split(/\s+/);
  let firstName = nameParts[0] || "JOHN";
  let lastName = nameParts.slice(1).join(" ") || "DOE";
  
  // Clean up and uppercase
  firstName = firstName.toUpperCase();
  lastName = lastName.toUpperCase();
  
  // Generate 1-3 results, first one uses the actual name
  const persons = [];
  
  // Primary result with the actual searched name
  persons.push(generatePersonWithName(query, firstName, lastName));
  
  // Maybe add 1-2 similar results (partial matches)
  const rand = Math.random();
  if (rand > 0.5) {
    persons.push(generatePersonWithName(`${query}-2`, firstName, lastName + "SON"));
  }
  if (rand > 0.7) {
    persons.push(generatePersonWithName(`${query}-3`, firstName + "Y", lastName));
  }

  return NextResponse.json({ persons });
}
