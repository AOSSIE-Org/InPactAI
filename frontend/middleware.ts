import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute = publicRoutes.includes(path);

  // Protected routes that require authentication
  const isProtectedRoute =
    path.startsWith("/creator") || path.startsWith("/brand");

  // For protected routes, the AuthGuard component will handle the authentication check
  // This middleware is just for basic routing logic

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
