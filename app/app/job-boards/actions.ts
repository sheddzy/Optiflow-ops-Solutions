"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";

const providers = ["linkedin", "indeed", "jobberman", "other"] as const;

export async function queueVacancyForBoardsAction(formData: FormData) {
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const roleId = String(formData.get("role_id") ?? "").trim();
  const selected = formData.getAll("providers").map(String).filter((provider) => providers.includes(provider as typeof providers[number]));
  if (!roleId || !selected.length) throw new Error("Choose a vacancy and at least one job board.");
  const roles = await recruitmentData<Record<string, unknown>[]>(
    `roles?select=id,job_title,status,description,requirements,responsibilities,location,employment_type,workplace_type,salary_min,salary_max,salary_currency&agency_id=eq.${membership.agency_id}&id=eq.${encodeURIComponent(roleId)}&limit=1`,
  );
  const role = roles[0];
  if (!role) throw new Error("Vacancy not found in this agency.");
  if (role.status !== "open") throw new Error("Only open vacancies can be queued for publishing.");
  for (const provider of selected) {
    await recruitmentData("job_board_publications", {
      method: "POST",
      body: {
        agency_id: membership.agency_id,
        role_id: roleId,
        provider,
        publication_status: "queued",
      },
      prefer: "return=minimal",
    });
  }
  revalidatePath("/app/job-boards");
  redirect("/app/job-boards?queued=1");
}

export async function updatePublicationAction(formData: FormData) {
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const url = String(formData.get("public_url") ?? "").trim();
  if (!id || !["published", "paused", "expired", "failed"].includes(status)) throw new Error("Invalid publication update.");
  if (url && !/^https:\/\//i.test(url)) throw new Error("Publication URL must use HTTPS.");
  await recruitmentData(
    `job_board_publications?id=eq.${encodeURIComponent(id)}&agency_id=eq.${membership.agency_id}`,
    { method: "PATCH", body: { publication_status: status, public_url: url || null, published_at: status === "published" ? new Date().toISOString() : null }, prefer: "return=minimal" },
  );
  revalidatePath("/app/job-boards");
  redirect("/app/job-boards?saved=1");
}

export async function togglePublicVacancyAction(formData: FormData) {
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const roleId = String(formData.get("role_id") ?? "").trim();
  const isPublic = String(formData.get("is_public") ?? "") === "true";
  if (!roleId) throw new Error("Vacancy ID is required.");
  const roles = await recruitmentData<{id:string;status:string}[]>(
    `roles?select=id,status&agency_id=eq.${membership.agency_id}&id=eq.${encodeURIComponent(roleId)}&limit=1`,
  );
  if (!roles[0] || roles[0].status !== "open") throw new Error("Only an open vacancy in this agency can be published.");
  await recruitmentData(`roles?id=eq.${encodeURIComponent(roleId)}&agency_id=eq.${membership.agency_id}`, {
    method: "PATCH", body: { is_public: isPublic }, prefer: "return=minimal",
  });
  revalidatePath("/app/job-boards");
  revalidatePath("/jobs");
  redirect("/app/job-boards?public=1");
}
