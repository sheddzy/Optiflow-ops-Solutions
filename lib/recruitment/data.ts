import "server-only";

import { neonAuth } from "@/lib/auth/neon";

type DataApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
};

function dataApiUrl(path: string) {
  const base = process.env.NEON_DATA_API_URL;
  if (!base) throw new Error("NEON_DATA_API_URL is not configured.");
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

export async function recruitmentData<T>(
  path: string,
  options: DataApiOptions = {},
): Promise<T> {
  const { data, error } = await neonAuth.token();
  const accessToken = data?.token;

  if (error || !accessToken) {
    throw new Error("Your session has expired. Sign in again.");
  }

  const response = await fetch(dataApiUrl(path), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    cache: "no-store",
  });

  const responseText = await response.text();
  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Recruitment database request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

export type AgencyMembership = {
  agency_id: string;
  role: "owner" | "admin" | "recruiter";
};

export async function getCurrentAgencyMembership() {
  const memberships = await recruitmentData<AgencyMembership[]>(
    "agency_memberships?select=agency_id,role&status=eq.active&order=created_at.asc&limit=1",
  );
  return memberships[0] ?? null;
}

export async function getAgency(agencyId: string) {
  const agencies = await recruitmentData<
    { id: string; name: string; slug: string; status: string }[]
  >(
    `agencies?select=id,name,slug,status&id=eq.${encodeURIComponent(agencyId)}&limit=1`,
  );
  return agencies[0] ?? null;
}

export async function createAgencyWorkspace(name: string, slug: string) {
  const result = await recruitmentData<string>(
    "rpc/create_agency_workspace",
    {
      method: "POST",
      body: { p_name: name, p_slug: slug },
    },
  );
  return result;
}
