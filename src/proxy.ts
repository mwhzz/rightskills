import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMaintenanceBypass, MAINTENANCE_MODE } from "./lib/maintenance";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const pathname = request.nextUrl.pathname;

  // Send www to the main domain so Google sees one site, not two.
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim();
  if (host.startsWith("www.")) {
    const target = new URL(`${pathname}${request.nextUrl.search}`, `https://${host.slice(4)}`);
    return NextResponse.redirect(target, 308);
  }

  if (
    MAINTENANCE_MODE &&
    !isMaintenanceBypass(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.headers.set("Retry-After", "3600");
    return response;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
