import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/" || pathname === "") {
    return new NextResponse("OK", { status: 200 });
  }
  return NextResponse.next();
}
