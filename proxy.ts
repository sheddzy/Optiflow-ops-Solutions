import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs only for /admin and /login. It refreshes the Supabase session cookie and sends
 * signed-out visitors to the login page. This is a convenience layer: every admin page and
 * action also checks the admin role on the server, and the database enforces it with RLS.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
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

export const config = { matcher: ["/admin/:path*", "/login"] };
