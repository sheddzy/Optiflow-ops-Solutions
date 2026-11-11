import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { neonAuth } from "@/lib/auth/neon";

const neonMiddleware = neonAuth.middleware({ loginUrl: "/auth/sign-in" });

/**
 * Recruitment workspace routes use Neon Auth.
 * Existing public-site admin routes continue to use Supabase Auth.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/app")) {
    return neonMiddleware(request);
  }

  let response = NextResponse.next({ request });
  if (process.env.ENABLE_ADMIN !== "true") return response;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = { matcher: ["/app/:path*", "/admin/:path*", "/login"] };
