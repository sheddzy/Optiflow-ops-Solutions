import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase client that acts as the signed-in person (reads their session cookie). RLS applies. */
export async function serverClient() {
  const store = await cookies(); // reading cookies first marks every admin page as dynamic, never prerendered
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a Server Component: the proxy refreshes sessions instead */ }
      },
    },
  });
}
