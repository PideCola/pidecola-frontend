import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySetCookie, checkSession } from "./lib/services/checkSession";
import { getUserRole, userHasRideOrRequest } from "./lib/services/user";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const accessToken = request.cookies.get("access_token")?.value;

  // Si un usuario tiene una sesión válida, no tiene que entrar
  // en login, register o index
  if (
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/login")
  ) {
    const { isValidSession } = await checkSession(refreshToken);

    if (isValidSession)
      return NextResponse.redirect(new URL("/home", request.url));
  }

  // Si un usuario no tiene una sesión válida tiene que registrarse
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/request-ride") ||
    pathname.startsWith("/offer-seats") ||
    pathname.startsWith("/home")
  ) {
    const { isValidSession, response } = await checkSession(refreshToken);

    if (!isValidSession)
      return NextResponse.redirect(new URL("/login", request.url));

    if (pathname.startsWith("/offer-seats")) {
      const userRole = await getUserRole(accessToken);
      if (userRole !== "driver")
        return NextResponse.redirect(new URL("/request-ride", request.url));
    }

    if (!pathname.startsWith("/profile") && !pathname.startsWith("/vehicles")) {
      const hasActiveTravel = await userHasRideOrRequest(accessToken);
      if (!pathname.startsWith("/request-ride") && hasActiveTravel?.request)
        return NextResponse.redirect(new URL("/request-ride", request.url));
      if (!pathname.startsWith("/offer-seats") && hasActiveTravel?.ride)
        return NextResponse.redirect(new URL("/offer-seats", request.url));
    }

    // Fix to Server Actions getting outdated cookies
    if (response) applySetCookie(request, response);

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
