import type { Metadata } from "next";
import Link from "next/link";
import ProjectGrid from "@/components/ProjectGrid";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Portfolio", description: "Projects, demonstrations and prototypes from OptiFlow Ops Solutions.", alternates: { canonical: "/portfolio" } };
export const revalidate = 60;

export default async function Portfolio() {
  const projects = await getProjects();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <h1 className="text-4xl font-bold text-navy sm:text-5xl">Portfolio</h1>
      <p className="mt-6 max-w-2xl text-lg text-slate">Projects, demonstrations and prototypes. Each entry is labelled so you can tell client work from demonstrations.</p>
      <div className="mt-12">
        {projects.length === 0 ? (
          <div className="max-w-xl rounded-md border border-line bg-white p-8">
            <h2 className="text-xl font-semibold">Portfolio entries are coming soon</h2>
            <p className="mt-2 text-slate">We publish work here only when it is ready to show. If you would like to see what we can build, ask us for a walkthrough.</p>
            <Link href="/contact" className="btn btn-primary mt-6">Request a walkthrough</Link>
          </div>
        ) : <ProjectGrid projects={projects} />}
      </div>
    </div>
  );
}
