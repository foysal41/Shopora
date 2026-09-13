import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --------------------------------
  // Public routes
  // --------------------------------
  const publicRoutes = [
    "/",
    "/shop",
    "/products",
    "/brands",
    "/about",
    "/contact",
    "/auth/login",
    "/auth/register",
  ];

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // --------------------------------
  // Protected routes
  // --------------------------------
  const isCustomerRoute = pathname.startsWith("/dashboard/customer");
  const isSellerRoute = pathname.startsWith("/dashboard/seller");
  const isAdminRoute = pathname.startsWith("/dashboard/admin");

  const isAccountRoute = pathname.startsWith("/account");
  const isWishlistRoute = pathname.startsWith("/wishlist");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  const isProtectedRoute =
    isCustomerRoute ||
    isSellerRoute ||
    isAdminRoute ||
    isAccountRoute ||
    isWishlistRoute ||
    isCheckoutRoute;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // --------------------------------
  // Get Better Auth session
  // --------------------------------
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // --------------------------------
  // User is not logged in
  // --------------------------------
  if (!session?.user) {
    const loginUrl = new URL("/auth/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // --------------------------------
  // Get user role
  // --------------------------------
  const role = session.user.role;

  // --------------------------------
  // Customer dashboard
  // --------------------------------
  if (isCustomerRoute) {
    if (role !== "Customer") {
      return NextResponse.redirect(
        new URL("/dashboard/customer", request.url)
      );
    }

    return NextResponse.next();
  }

  // --------------------------------
  // Seller dashboard
  // --------------------------------
  if (isSellerRoute) {
    if (role !== "Seller") {
      if (role === "Admin") {
        return NextResponse.redirect(
          new URL("/dashboard/admin", request.url)
        );
      }

      return NextResponse.redirect(
        new URL("/dashboard/customer", request.url)
      );
    }

    return NextResponse.next();
  }

  // --------------------------------
  // Admin dashboard
  // --------------------------------
  if (isAdminRoute) {
    if (role !== "Admin") {
      if (role === "Seller") {
        return NextResponse.redirect(
          new URL("/dashboard/seller", request.url)
        );
      }

      return NextResponse.redirect(
        new URL("/dashboard/customer", request.url)
      );
    }

    return NextResponse.next();
  }

  // --------------------------------
  // Other logged-in routes
  // --------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy on all routes except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - common static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};