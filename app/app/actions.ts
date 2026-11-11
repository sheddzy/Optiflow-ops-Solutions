"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import {
  createAgencyWorkspace,
  getCurrentAgencyMembership,
  recruitmentData,
} from "@/lib/recruitment/data";
import { recruitmentModules } from "@/lib/recruitment/modules";

export async function signOutAction() {
  await neonAuth.signOut();
  redirect("/auth/sign-in");
}

function getModule(table: string) {
  const module = recruitmentModules[table];
  if (!module) throw new Error("Invalid recruitment module.");
  return module;
}

function readFields(formData: FormData, table: string) {
  const module = getModule(table);
  const payload: Record<string, unknown> = {};

  for (const field of module.fields) {
    const raw = String(formData.get(field.name) ?? "").trim();
    if (!raw) {
      if (field.required) throw new Error(`${field.label} is required.`);
      continue;
    }

    if (field.type === "number") {
      const numberValue = Number(raw);
      if (!Number.isFinite(numberValue)) {
        throw new Error(`${field.label} must be a valid number.`);
      }
      payload[field.name] = numberValue;
    } else if (field.name === "skills") {
      payload[field.name] = raw.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (field.type === "datetime-local") {
      payload[field.name] = `${raw}:00+01:00`;
    } else {
      payload[field.name] = raw;
    }
  }

  return payload;
}

async function recordActivity(
  agencyId: string,
  entityType: string,
  entityId: string | undefined,
  action: string,
  summary: string,
) {
  try {
    await recruitmentData("recruitment_activities", {
      method: "POST",
      body: {
        agency_id: agencyId,
        entity_type: entityType,
        entity_id: entityId ?? null,
        action,
        summary,
      },
      prefer: "return=minimal",
    });
  } catch {
    // The primary record operation must not be rolled back by an activity-feed failure.
  }
}

export async function createAgencyAction(formData: FormData) {
  const { data: session } = await neonAuth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const name = String(formData.get("agency_name") ?? "").trim();
  const slug = String(formData.get("agency_slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (name.length < 2 || slug.length < 2) {
    throw new Error("Enter a valid agency name.");
  }

  await createAgencyWorkspace(name, slug);
  redirect("/app");
}

export async function createRecordAction(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const module = getModule(table);
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const payload = {
    ...readFields(formData, table),
    agency_id: membership.agency_id,
  };

  const created = await recruitmentData<Record<string, unknown>[]>(
    `${module.table}?select=id`,
    { method: "POST", body: payload, prefer: "return=representation" },
  );

  await recordActivity(
    membership.agency_id,
    module.entityType,
    typeof created?.[0]?.id === "string" ? created[0].id : undefined,
    "created",
    `${module.singular} created`,
  );

  redirect(`/app/${table}?saved=1`);
}

export async function updateRecordAction(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const module = getModule(table);
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Record ID is missing.");

  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  await recruitmentData(
    `${module.table}?id=eq.${encodeURIComponent(id)}&agency_id=eq.${encodeURIComponent(membership.agency_id)}`,
    {
      method: "PATCH",
      body: readFields(formData, table),
      prefer: "return=minimal",
    },
  );

  await recordActivity(
    membership.agency_id,
    module.entityType,
    id,
    "updated",
    `${module.singular} updated`,
  );

  redirect(`/app/${table}?saved=1`);
}

export async function deleteRecordAction(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const module = getModule(table);
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Record ID is missing.");

  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  await recruitmentData(
    `${module.table}?id=eq.${encodeURIComponent(id)}&agency_id=eq.${encodeURIComponent(membership.agency_id)}`,
    { method: "DELETE", prefer: "return=minimal" },
  );

  await recordActivity(
    membership.agency_id,
    module.entityType,
    id,
    "deleted",
    `${module.singular} deleted`,
  );

  redirect(`/app/${table}?deleted=1`);
}
