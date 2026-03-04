import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // POC Mode: Skip authentication entirely
  // Just pass through all requests
  
  // If user is on login page and has already set up their unit, redirect to home
  if (request.nextUrl.pathname.startsWith("/auth")) {
    // Let them access the login/setup page
    return NextResponse.next();
  }

  // Allow all other requests through without auth check
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
