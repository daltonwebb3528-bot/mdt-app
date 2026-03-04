import { NextResponse } from "next/server";

// POC Mode: No authentication - pass everything through
export function middleware() {
  return NextResponse.next();
}

// Empty matcher = middleware won't run on any routes
export const config = {
  matcher: [],
};
