import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Only runs for /admin/* — every other route (the storefront, /api/orders,
// /api/reviews) is untouched by this proxy entirely, so Phase 1's
// checkout flow has zero new latency or failure modes from Phase 2's auth.
// (Named `proxy.ts` per Next.js 16's convention — this file was called
// `middleware.ts` in Next 14/15, same job, new name.)
export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!url || !anonKey) {
    // Supabase isn't configured yet — every /admin route except the login
    // page (which renders its own "not configured" message) redirects
    // there rather than 500ing.
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/reviews", request.url));
  }

  return response;
}
