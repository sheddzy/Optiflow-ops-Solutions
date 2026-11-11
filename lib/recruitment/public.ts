import "server-only";

const apiBase = () => {
  const base = process.env.NEON_DATA_API_URL;
  if (!base) throw new Error("Public recruitment data API is not configured.");
  return base.replace(/\/$/, "");
};

export async function publicRecruitmentRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${apiBase()}/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload
      ? String(payload.message) : "Public recruitment request failed.";
    throw new Error(message);
  }
  return payload as T;
}
