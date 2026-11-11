import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency, getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { moduleNavigation, recruitmentModules, type ModuleField } from "@/lib/recruitment/modules";
import { createRecordAction, deleteRecordAction, updateRecordAction, signOutAction } from "../actions";

export const dynamic = "force-dynamic";

type RecordRow = Record<string, unknown>;

function fieldValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function inputValue(field: ModuleField, value: unknown) {
  const text = fieldValue(value);
  if (field.type === "datetime-local" && text) return text.slice(0, 16);
  if (field.type === "date" && text) return text.slice(0, 10);
  return text;
}

function FormField({ field, value, options }: { field: ModuleField; value?: unknown; options?: { label: string; value: string }[] }) {
  const id = `field-${field.name}`;
  const common = {
    id,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder ?? "",
    className: "w-full rounded-lg border border-[#dce4ed] bg-white px-3 py-2.5 text-sm text-[#243b53] outline-none transition focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10",
  };

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#52657d]">{field.label}{field.required ? " *" : ""}</label>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} defaultValue={fieldValue(value)} />
      ) : field.type === "select" ? (
        <select {...common} defaultValue={inputValue(field, value)}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {(options ?? field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input {...common} type={field.type ?? "text"} step={field.type === "number" ? "any" : undefined} defaultValue={inputValue(field, value)} />
      )}
      {field.help ? <p className="mt-1 text-[11px] leading-4 text-[#8a98a9]">{field.help}</p> : null}
    </div>
  );
}

export default async function RecruitmentModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ module: moduleKey }, query, { data: session }] = await Promise.all([
    params,
    searchParams,
    neonAuth.getSession(),
  ]);
  if (!session?.user) redirect("/auth/sign-in");

  const module = recruitmentModules[moduleKey];
  if (!module) notFound();

  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const agency = await getAgency(membership.agency_id);
  let rows: RecordRow[] = [];
  let loadError = "";
  try {
    rows = await recruitmentData<RecordRow[]>(
      `${module.table}?select=*&agency_id=eq.${encodeURIComponent(membership.agency_id)}&order=created_at.desc&limit=100`,
    );
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load records.";
  }

  const relatedTables = [...new Set(
    module.fields
      .filter((field) => ["client_id", "project_id", "candidate_id", "role_id", "application_id"].includes(field.name))
      .map((field) => field.name === "client_id" ? "clients" : field.name === "project_id" ? "projects" : field.name === "candidate_id" ? "candidates" : field.name === "role_id" ? "roles" : "applications"),
  )];
  const relatedData = await Promise.all(relatedTables.map(async (table) => {
    const select = table === "clients" ? "id,company_name" : table === "projects" ? "id,project_name" : table === "candidates" ? "id,first_name,last_name,email" : table === "roles" ? "id,job_title,status" : "id,status";
    try {
      const records = await recruitmentData<Record<string, unknown>[]>(
        `${table}?select=${select}&agency_id=eq.${encodeURIComponent(membership.agency_id)}&order=created_at.desc&limit=200`,
      );
      return [table, records] as const;
    } catch {
      return [table, [] as Record<string, unknown>[]] as const;
    }
  }));
  const relationOptions: Record<string, { label: string; value: string }[]> = {};
  for (const [table, records] of relatedData) {
    relationOptions[table] = records.map((record) => {
      const label = table === "clients"
        ? String(record.company_name ?? "Client")
        : table === "projects"
          ? String(record.project_name ?? "Project")
          : table === "candidates"
            ? `${String(record.first_name ?? "")} ${String(record.last_name ?? "")}${record.email ? ` · ${String(record.email)}` : ""}`
            : table === "roles"
              ? `${String(record.job_title ?? "Role")} · ${String(record.status ?? "")}`
              : `${String(record.status ?? "Application")} · ${String(record.id).slice(0, 8)}`;
      return { label, value: String(record.id) };
    });
  }
  const fieldOptions = (field: ModuleField) => {
    const table = field.name === "client_id" ? "clients" : field.name === "project_id" ? "projects" : field.name === "candidate_id" ? "candidates" : field.name === "role_id" ? "roles" : field.name === "application_id" ? "applications" : null;
    return table ? relationOptions[table] ?? [] : field.options;
  };
  const search = (typeof query.q === "string" ? query.q : "").trim().toLowerCase();
  const visibleRows = search
    ? rows.filter((row) => Object.values(row).some((value) => fieldValue(value).toLowerCase().includes(search)))
    : rows;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e4eaf1] bg-white lg:flex">
          <div className="border-b border-[#edf1f5] px-6 py-6">
            <Link href="/app" className="text-lg font-extrabold tracking-tight text-[#1b3a63]">OptiFlow <span className="text-[#0b7886]">Recruitment</span></Link>
            <p className="mt-1 truncate text-xs text-[#8492a3]">{agency?.name ?? "Agency workspace"}</p>
          </div>
          <nav aria-label="Recruitment modules" className="space-y-1 px-4 py-5">
            <Link href="/app" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#65758b] hover:bg-[#f5f8fb]">▦ <span>Overview</span></Link>
            {moduleNavigation.map((item) => (
              <Link key={item.key} href={`/app/${item.key}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${item.key === moduleKey ? "bg-[#edf4fb] text-[#1b3a63]" : "text-[#65758b] hover:bg-[#f5f8fb] hover:text-[#1b3a63]"}`}>
                <span className="w-5 text-center">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#edf1f5] p-4">
            <p className="mb-3 truncate text-xs text-[#8492a3]">{session.user.email}</p>
            <form action={signOutAction}><button className="w-full rounded-lg border border-[#e3eaf1] px-3 py-2 text-left text-xs font-semibold text-[#52657d] hover:bg-[#f5f8fb]">Sign out</button></form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs text-[#8b99aa]"><Link href="/app" className="hover:text-[#0b7886]">Workspace</Link> / {module.title}</p>
              <h1 className="mt-1 text-lg font-bold text-[#1b3a63]">{module.title}</h1>
            </div>
            <span className="hidden max-w-64 truncate text-xs font-medium text-[#718096] sm:inline">{session.user.email}</span>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-[#0b7886]">{agency?.name ?? "Agency workspace"}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1b3a63]">{module.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718096]">{module.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#52657d] ring-1 ring-[#e5ebf2]">{visibleRows.length} records shown</span>
            </div>

            <section className="mt-7 rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] sm:p-6">
              <details>
                <summary className="cursor-pointer list-none text-sm font-bold text-[#1b3a63]">＋ Add {module.singular.toLowerCase()} <span className="ml-2 text-xs font-normal text-[#8492a3]">Open form</span></summary>
                <form action={createRecordAction} className="mt-5 border-t border-[#edf1f5] pt-5">
                  <input type="hidden" name="table" value={module.table} />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {module.fields.map((field) => <FormField key={field.name} field={field} options={fieldOptions(field)} />)}
                  </div>
                  <button type="submit" className="mt-5 rounded-lg bg-[#1b3a63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#11284a]">Save {module.singular.toLowerCase()}</button>
                </form>
              </details>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-[#e5ebf2] bg-white shadow-[0_2px_8px_rgba(23,43,77,.03)]">
              <div className="flex flex-col gap-3 border-b border-[#edf1f5] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#1b3a63]">All {module.title.toLowerCase()}</h3>
                  <p className="mt-1 text-xs text-[#8a98a9]">Showing up to 100 most recent records.</p>
                </div>
                <form method="get" className="flex gap-2">
                  <input name="q" defaultValue={typeof query.q === "string" ? query.q : ""} placeholder={`Search ${module.title.toLowerCase()}...`} className="min-w-0 rounded-lg border border-[#dce4ed] px-3 py-2 text-sm outline-none focus:border-[#0b7886] sm:w-64" />
                  <button className="rounded-lg border border-[#dce4ed] px-3 py-2 text-xs font-semibold text-[#52657d] hover:bg-[#f5f8fb]">Search</button>
                </form>
              </div>

              {loadError ? (
                <div className="p-6">
                  <p className="text-sm font-semibold text-[#9b3c32]">Could not load this module.</p>
                  <p className="mt-1 text-xs leading-5 text-[#718096]">{loadError}</p>
                  <p className="mt-2 text-xs leading-5 text-[#718096]">Confirm that the required Neon recruitment migrations have been applied and the Data API is enabled for this database.</p>
                </div>
              ) : visibleRows.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm font-semibold text-[#52657d]">{search ? "No matching records" : `No ${module.title.toLowerCase()} yet`}</p>
                  <p className="mt-1 text-xs text-[#98a4b3]">Use the add form above to create the first record.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-wide text-[#8391a2]">
                      <tr>{module.columns.map((column) => <th key={column.key} className="px-5 py-3 font-semibold">{column.label}</th>)}<th className="px-5 py-3 font-semibold">Manage</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1f5]">
                      {visibleRows.map((row) => (
                        <tr key={String(row.id)} className="align-top hover:bg-[#fbfcfe]">
                          {module.columns.map((column) => <td key={column.key} className="max-w-64 px-5 py-4 text-xs text-[#52657d]"><span className="block truncate">{fieldValue(row[column.key]) || "—"}</span></td>)}
                          <td className="px-5 py-3">
                            <details className="min-w-40">
                              <summary className="cursor-pointer text-xs font-semibold text-[#0b7886]">Edit / delete</summary>
                              <div className="absolute z-10 mt-2 max-h-[70vh] w-[min(680px,90vw)] overflow-y-auto rounded-xl border border-[#dce4ed] bg-white p-5 shadow-xl">
                                <form action={updateRecordAction}>
                                  <input type="hidden" name="table" value={module.table} />
                                  <input type="hidden" name="id" value={String(row.id)} />
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    {module.fields.map((field) => <FormField key={field.name} field={field} value={row[field.name]} options={fieldOptions(field)} />)}
                                  </div>
                                  <div className="mt-5 flex flex-wrap gap-2">
                                    <button type="submit" className="rounded-lg bg-[#1b3a63] px-4 py-2 text-xs font-semibold text-white">Save changes</button>
                                  </div>
                                </form>
                                <form action={deleteRecordAction} className="mt-3 border-t border-[#edf1f5] pt-3">
                                  <input type="hidden" name="table" value={module.table} />
                                  <input type="hidden" name="id" value={String(row.id)} />
                                  <button type="submit" className="rounded-lg border border-[#e8c9c5] px-4 py-2 text-xs font-semibold text-[#9b3c32]">Delete record</button>
                                </form>
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <p className="mt-5 text-xs text-[#98a4b3]">Record IDs are used to link projects, vacancies, candidates and applications. Copy the relevant ID when creating a related record.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
