import type { Project } from "@/lib/content";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {projects.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-md border border-line bg-white">
          {p.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={`Screenshot of ${p.title}`} loading="lazy" className="aspect-[16/9] w-full object-cover" />
          )}
          <div className="p-6">
            <span className="inline-block rounded bg-mist px-2.5 py-1 text-sm font-semibold text-navy">{p.project_type}</span>
            <h3 className="mt-3 text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-slate">{p.description}</p>
            {p.technologies.length > 0 && <p className="mt-4 text-sm text-slate"><span className="font-semibold text-ink">Built with:</span> {p.technologies.join(", ")}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
