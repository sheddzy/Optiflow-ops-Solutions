import type { Status } from "@/lib/admin";

const TONE: Record<Status, string> = {
  New: "bg-[#dff5f8] text-[#075764]",
  Contacted: "bg-mist text-navy",
  Qualified: "bg-[#dfe7f5] text-navy",
  "Proposal Sent": "bg-[#fdf1d6] text-[#7a5200]",
  Won: "bg-[#dcf3e3] text-[#17622f]",
  Lost: "bg-[#f1e3e1] text-[#8a2a1f]",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-block whitespace-nowrap rounded px-2.5 py-1 text-sm font-semibold ${TONE[status] ?? "bg-mist text-navy"}`}>{status}</span>;
}

export function Flash({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return err
    ? <p role="alert" className="mb-6 rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-3 text-sm text-[#b42318]">{err.slice(0, 200)}</p>
    : <p role="status" className="mb-6 rounded-md border border-[#17622f]/30 bg-[#effaf2] p-3 text-sm text-[#17622f]">{ok!.slice(0, 200)}</p>;
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-navy">{title}</h1>
      {children}
    </div>
  );
}

/** Two-step delete without client JavaScript: open the panel, then confirm. */
export function DeleteBox({ label, warning, action, id }: { label: string; warning: string; action: (fd: FormData) => Promise<void>; id: string }) {
  return (
    <details className="mt-10 rounded-md border border-[#b42318]/30 bg-white p-4">
      <summary className="cursor-pointer font-semibold text-[#b42318]">{label}</summary>
      <form action={action} className="mt-4">
        <input type="hidden" name="id" value={id} />
        <p className="mb-4 text-sm text-slate">{warning}</p>
        <button type="submit" className="btn bg-[#b42318] text-white hover:bg-[#8a1b12]">Yes, delete permanently</button>
      </form>
    </details>
  );
}
