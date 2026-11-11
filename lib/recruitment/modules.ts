export type FieldOption = { label: string; value: string };

export type ModuleField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "number" | "date" | "datetime-local" | "select" | "textarea";
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  help?: string;
};

export type RecruitmentModule = {
  table: string;
  title: string;
  singular: string;
  description: string;
  entityType: string;
  fields: ModuleField[];
  columns: { key: string; label: string }[];
};

const status = (values: string[]) => values.map((value) => ({
  label: value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  value,
}));

export const recruitmentModules: Record<string, RecruitmentModule> = {
  clients: {
    table: "clients",
    title: "Clients",
    singular: "Client",
    description: "Manage hiring organisations, business contacts and client relationships.",
    entityType: "client",
    fields: [
      { name: "company_name", label: "Company name", required: true },
      { name: "industry", label: "Industry" },
      { name: "website", label: "Website", type: "url" },
      { name: "company_email", label: "Company email", type: "email" },
      { name: "company_phone", label: "Company phone", type: "tel" },
      { name: "primary_contact_name", label: "Primary contact" },
      { name: "primary_contact_email", label: "Contact email", type: "email" },
      { name: "primary_contact_phone", label: "Contact phone", type: "tel" },
      { name: "relationship_status", label: "Relationship status", type: "select", options: status(["prospect", "active", "inactive", "former"]) },
      { name: "address", label: "Address" },
      { name: "country", label: "Country" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "company_name", label: "Company" },
      { key: "industry", label: "Industry" },
      { key: "primary_contact_name", label: "Primary contact" },
      { key: "relationship_status", label: "Status" },
    ],
  },
  projects: {
    table: "projects",
    title: "Projects",
    singular: "Project",
    description: "Organise recruitment assignments, delivery plans, owners and deadlines.",
    entityType: "project",
    fields: [
      { name: "client_id", label: "Client ID", required: true, help: "Paste the ID of an existing client record." },
      { name: "project_name", label: "Project name", required: true },
      { name: "reference_code", label: "Reference code" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "objectives", label: "Objectives", type: "textarea" },
      { name: "scope_of_work", label: "Scope of work", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: status(["planning", "active", "on_hold", "completed", "cancelled"]) },
      { name: "priority", label: "Priority", type: "select", options: status(["low", "normal", "high", "urgent"]) },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "target_end_date", label: "Target end date", type: "date" },
      { name: "budget", label: "Budget", type: "number" },
      { name: "agreed_fee", label: "Agreed fee", type: "number" },
      { name: "currency", label: "Currency", placeholder: "NGN" },
      { name: "project_owner", label: "Project owner" },
      { name: "internal_notes", label: "Internal notes", type: "textarea" },
    ],
    columns: [
      { key: "project_name", label: "Project" },
      { key: "client_id", label: "Client ID" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "target_end_date", label: "Target date" },
    ],
  },
  roles: {
    table: "roles",
    title: "Roles & vacancies",
    singular: "Role",
    description: "Create job openings and track hiring requirements and ownership.",
    entityType: "role",
    fields: [
      { name: "client_id", label: "Client ID", required: true, help: "Paste the ID of an existing client record." },
      { name: "project_id", label: "Project ID", help: "Optional. Paste the ID of an existing project." },
      { name: "job_title", label: "Job title", required: true },
      { name: "department", label: "Department" },
      { name: "description", label: "Job description", type: "textarea" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea" },
      { name: "requirements", label: "Requirements", type: "textarea" },
      { name: "qualifications", label: "Qualifications", type: "textarea" },
      { name: "experience_years_min", label: "Minimum experience (years)", type: "number" },
      { name: "experience_years_max", label: "Maximum experience (years)", type: "number" },
      { name: "employment_type", label: "Employment type", type: "select", options: status(["full_time", "part_time", "contract", "temporary", "internship"]) },
      { name: "workplace_type", label: "Workplace", type: "select", options: status(["onsite", "hybrid", "remote"]) },
      { name: "location", label: "Location" },
      { name: "salary_min", label: "Minimum salary", type: "number" },
      { name: "salary_max", label: "Maximum salary", type: "number" },
      { name: "salary_currency", label: "Salary currency", placeholder: "NGN" },
      { name: "vacancies_count", label: "Number of vacancies", type: "number" },
      { name: "hiring_manager_name", label: "Hiring manager" },
      { name: "hiring_manager_email", label: "Hiring manager email", type: "email" },
      { name: "assigned_recruiter", label: "Assigned recruiter" },
      { name: "application_deadline", label: "Application deadline", type: "date" },
      { name: "status", label: "Status", type: "select", options: status(["draft", "open", "on_hold", "filled", "cancelled", "closed"]) },
    ],
    columns: [
      { key: "job_title", label: "Job title" },
      { key: "client_id", label: "Client ID" },
      { key: "vacancies_count", label: "Vacancies" },
      { key: "status", label: "Status" },
      { key: "application_deadline", label: "Deadline" },
    ],
  },
  candidates: {
    table: "candidates",
    title: "Candidates",
    singular: "Candidate",
    description: "Build a searchable candidate pool and maintain candidate profiles and consent records.",
    entityType: "candidate",
    fields: [
      { name: "first_name", label: "First name", required: true },
      { name: "last_name", label: "Last name", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "location", label: "Location" },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { name: "portfolio_url", label: "Portfolio URL", type: "url" },
      { name: "current_job_title", label: "Current job title" },
      { name: "current_employer", label: "Current employer" },
      { name: "years_experience", label: "Years of experience", type: "number" },
      { name: "highest_qualification", label: "Highest qualification" },
      { name: "skills", label: "Skills", help: "Separate skills with commas." },
      { name: "resume_url", label: "Resume URL", type: "url" },
      { name: "source", label: "Candidate source" },
      { name: "consent_status", label: "Data consent", type: "select", options: status(["pending", "granted", "withdrawn", "not_required"]) },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "first_name", label: "First name" },
      { key: "last_name", label: "Last name" },
      { key: "current_job_title", label: "Current role" },
      { key: "email", label: "Email" },
      { key: "consent_status", label: "Consent" },
    ],
  },
  applications: {
    table: "applications",
    title: "Applications",
    singular: "Application",
    description: "Track each candidate against a vacancy from sourcing through offer or rejection.",
    entityType: "application",
    fields: [
      { name: "candidate_id", label: "Candidate ID", required: true },
      { name: "role_id", label: "Role ID", required: true },
      { name: "status", label: "Pipeline stage", type: "select", options: status(["sourced", "screening", "shortlisted", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]) },
      { name: "source", label: "Application source" },
      { name: "assigned_recruiter", label: "Assigned recruiter" },
      { name: "expected_salary", label: "Expected salary", type: "number" },
      { name: "currency", label: "Currency", placeholder: "NGN" },
      { name: "notice_period", label: "Notice period" },
      { name: "recruiter_notes", label: "Recruiter notes", type: "textarea" },
      { name: "rejection_reason", label: "Rejection reason", type: "textarea" },
    ],
    columns: [
      { key: "candidate_id", label: "Candidate ID" },
      { key: "role_id", label: "Role ID" },
      { key: "status", label: "Stage" },
      { key: "assigned_recruiter", label: "Recruiter" },
      { key: "applied_at", label: "Applied" },
    ],
  },
  interviews: {
    table: "interviews",
    title: "Interviews",
    singular: "Interview",
    description: "Schedule interviews, record feedback, ratings and outcomes.",
    entityType: "interview",
    fields: [
      { name: "application_id", label: "Application ID", required: true },
      { name: "interview_round", label: "Interview round", type: "number" },
      { name: "interview_type", label: "Interview type", type: "select", options: status(["phone", "video", "onsite", "technical", "panel", "other"]) },
      { name: "status", label: "Status", type: "select", options: status(["scheduled", "completed", "cancelled", "rescheduled", "no_show"]) },
      { name: "scheduled_at", label: "Date and time", type: "datetime-local", required: true },
      { name: "duration_minutes", label: "Duration (minutes)", type: "number" },
      { name: "location_or_link", label: "Location or meeting link" },
      { name: "interviewer_name", label: "Interviewer" },
      { name: "interviewer_email", label: "Interviewer email", type: "email" },
      { name: "feedback", label: "Feedback", type: "textarea" },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      { name: "outcome", label: "Outcome", type: "select", options: status(["pending", "pass", "fail", "hold"]) },
    ],
    columns: [
      { key: "application_id", label: "Application ID" },
      { key: "scheduled_at", label: "Scheduled" },
      { key: "interview_type", label: "Type" },
      { key: "interviewer_name", label: "Interviewer" },
      { key: "status", label: "Status" },
      { key: "outcome", label: "Outcome" },
    ],
  },
  placements: {
    table: "placements",
    title: "Placements",
    singular: "Placement",
    description: "Record hires, placement fees, invoices and guarantee periods.",
    entityType: "placement",
    fields: [
      { name: "application_id", label: "Application ID", required: true },
      { name: "client_id", label: "Client ID", required: true },
      { name: "status", label: "Status", type: "select", options: status(["pending_start", "active", "completed", "cancelled", "replacement"]) },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "annual_salary", label: "Annual salary", type: "number" },
      { name: "currency", label: "Currency", placeholder: "NGN" },
      { name: "fee_type", label: "Fee type", type: "select", options: status(["fixed", "percentage"]) },
      { name: "fee_amount", label: "Fee amount", type: "number" },
      { name: "invoice_status", label: "Invoice status", type: "select", options: status(["not_invoiced", "draft", "sent", "part_paid", "paid", "overdue", "waived"]) },
      { name: "guarantee_days", label: "Guarantee period (days)", type: "number" },
      { name: "guarantee_end_date", label: "Guarantee end date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "application_id", label: "Application ID" },
      { key: "client_id", label: "Client ID" },
      { key: "status", label: "Status" },
      { key: "fee_amount", label: "Fee" },
      { key: "invoice_status", label: "Invoice" },
      { key: "start_date", label: "Start date" },
    ],
  },
};

export const moduleNavigation = [
  { key: "clients", label: "Clients", icon: "▤" },
  { key: "projects", label: "Projects", icon: "◫" },
  { key: "roles", label: "Roles & vacancies", icon: "▣" },
  { key: "candidates", label: "Candidates", icon: "♙" },
  { key: "applications", label: "Applications", icon: "⇄" },
  { key: "interviews", label: "Interviews", icon: "◷" },
  { key: "placements", label: "Placements", icon: "✓" },
];
