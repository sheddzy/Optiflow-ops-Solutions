/** Turns the plain text boxes in the dashboard into structured data, and back again. */
export type Inc = { name: string; text: string; short?: string };
export type Qa = { q: string; a: string };

export const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
export const paras = (s: string) => s.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim()).filter(Boolean);

export function parseInclusions(s: string): { ok: true; v: Inc[] } | { ok: false; error: string } {
  const out: Inc[] = [];
  for (const l of lines(s)) {
    const [name, text, short] = l.split("|").map((x) => x.trim());
    if (!name || !text) return { ok: false, error: `Each included item needs a name and a description, separated by a | sign. Check this line: "${l.slice(0, 60)}"` };
    if (name.length > 80 || text.length > 400 || (short && short.length > 60)) return { ok: false, error: `This line is too long: "${l.slice(0, 60)}"` };
    out.push(short ? { name, text, short } : { name, text });
  }
  if (out.length > 40) return { ok: false, error: "Use at most 40 included items." };
  return { ok: true, v: out };
}
export const serializeInclusions = (v: Inc[]) => v.map((i) => [i.name, i.text, i.short].filter((x, k) => x || k < 2).join(" | ")).join("\n");

export function parseFaq(s: string): { ok: true; v: Qa[] } | { ok: false; error: string } {
  const out: Qa[] = [];
  for (const l of lines(s)) {
    const at = l.indexOf("|");
    const q = at > 0 ? l.slice(0, at).trim() : "";
    const a = at > 0 ? l.slice(at + 1).trim() : "";
    if (!q || !a) return { ok: false, error: `Each question needs an answer after a | sign. Check this line: "${l.slice(0, 60)}"` };
    if (q.length > 200 || a.length > 1200) return { ok: false, error: `This question or answer is too long: "${l.slice(0, 60)}"` };
    out.push({ q, a });
  }
  if (out.length > 30) return { ok: false, error: "Use at most 30 questions." };
  return { ok: true, v: out };
}
export const serializeFaq = (v: Qa[]) => v.map((f) => `${f.q} | ${f.a}`).join("\n");

/** Dashboard date boxes are in Lagos time (UTC+1, no daylight saving). */
export const lagosToIso = (local: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const d = new Date(`${local}:00+01:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
export const isoToLagos = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 3600_000);
  return d.toISOString().slice(0, 16);
};
