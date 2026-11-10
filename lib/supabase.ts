import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

type Opts = { revalidate?: number | false };

/**
 * Public (anon) client. Row Level Security decides what it can see or write.
 * revalidate: seconds to cache reads (pages refresh on a timer and instantly when you save in the dashboard).
 * revalidate: false means never cache (used at checkout, where the price must be fresh).
 */
export function publicClient(opts: Opts = {}) {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...(init as RequestInit), ...(opts.revalidate === false ? { cache: "no-store" } : opts.revalidate ? ({ next: { revalidate: opts.revalidate } } as object) : {}) }),
    },
  });
}
