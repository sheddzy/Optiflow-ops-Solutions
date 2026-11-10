import { PageHero } from "./Blocks";

export type LegalSection = { h: string; p?: string[]; ul?: string[] };

export default function Legal({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero title={title} art="legal" alt="Illustration of a document with text lines and a shield with a check mark" intro={intro} />
      <div className="mx-auto max-w-3xl space-y-8 px-5 pb-16 text-slate">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2 text-xl font-semibold text-ink">{s.h}</h2>
            {s.p?.map((t) => <p key={t} className="mb-3 leading-relaxed">{t}</p>)}
            {s.ul && <ul className="list-disc space-y-1.5 pl-5">{s.ul.map((t) => <li key={t}>{t}</li>)}</ul>}
          </section>
        ))}
      </div>
    </>
  );
}
