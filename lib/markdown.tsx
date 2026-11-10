import React from "react";

/**
 * A small, safe Markdown renderer for the blog and pages. It builds React elements directly
 * (never raw HTML), so pasted HTML or scripts are shown as plain text and cannot run.
 * Supports: ## headings, paragraphs, **bold**, *italic*, `code`, [links](url), ![images](url), lists, > quotes, --- rules, ``` code blocks.
 */
const safeHref = (u: string) => (/^(https?:\/\/|mailto:|\/|#)/i.test(u.trim()) ? u.trim() : null);
const safeImg = (u: string) => (/^(https:\/\/|\/)/i.test(u.trim()) ? u.trim() : null);

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|`([^`]+)`)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2] !== undefined && m[3]) {
      const src = safeImg(m[3]);
      // eslint-disable-next-line @next/next/no-img-element
      out.push(src ? <img key={k} src={src} alt={m[2]} loading="lazy" className="my-4 h-auto max-w-full rounded-md" /> : m[0]);
    } else if (m[4] && m[5]) {
      const href = safeHref(m[5]);
      out.push(href ? <a key={k} href={href} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-semibold text-teal-text underline">{m[4]}</a> : m[0]);
    } else if (m[6]) out.push(<strong key={k}>{m[6]}</strong>);
    else if (m[7]) out.push(<em key={k}>{m[7]}</em>);
    else if (m[8]) out.push(<code key={k} className="rounded bg-mist px-1.5 py-0.5 text-[0.9em]">{m[8]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const L = source.replace(/\r\n/g, "\n").split("\n");
  const els: React.ReactNode[] = [];
  let i = 0, n = 0;
  while (i < L.length) {
    const line = L[i];
    const key = `b${n++}`;
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const buf: string[] = []; i++;
      while (i < L.length && !L[i].startsWith("```")) buf.push(L[i++]);
      i++;
      els.push(<pre key={key} className="my-4 overflow-x-auto rounded-md bg-deep p-4 text-sm text-white"><code>{buf.join("\n")}</code></pre>);
      continue;
    }
    const standaloneImage = /^!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)$/.exec(line.trim());
    if (standaloneImage) {
      const src = safeImg(standaloneImage[2]);
      if (src) {
        els.push(
          <figure key={key} className="my-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={standaloneImage[1]} loading="lazy" className="mx-auto block h-auto max-h-[560px] w-full rounded-lg object-contain" />
            {standaloneImage[1] && <figcaption className="mt-2 text-center text-sm text-slate">{standaloneImage[1]}</figcaption>}
          </figure>
        );
      } else {
        els.push(<p key={key} className="my-4 leading-relaxed">{line}</p>);
      }
      i++; continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = Math.min(Math.max(h[1].length, 2), 4); // # and ## are section headings (h2); the page title is the only h1
      const cls = lvl === 2 ? "mt-10 mb-3 text-2xl font-bold text-navy" : lvl === 3 ? "mt-8 mb-2 text-xl font-semibold text-navy" : "mt-6 mb-2 text-lg font-semibold";
      els.push(React.createElement(`h${lvl}`, { key, className: cls }, inline(h[2], key)));
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) { els.push(<hr key={key} className="my-8 border-line" />); i++; continue; }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < L.length && L[i].startsWith(">")) buf.push(L[i++].replace(/^>\s?/, ""));
      els.push(<blockquote key={key} className="my-4 border-l-4 border-teal pl-4 italic text-slate">{inline(buf.join(" "), key)}</blockquote>);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < L.length && /^\s*[-*]\s+/.test(L[i])) items.push(L[i++].replace(/^\s*[-*]\s+/, ""));
      els.push(<ul key={key} className="my-4 list-disc space-y-1.5 pl-6">{items.map((t, k) => <li key={k}>{inline(t, `${key}-${k}`)}</li>)}</ul>);
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < L.length && /^\s*\d+[.)]\s+/.test(L[i])) items.push(L[i++].replace(/^\s*\d+[.)]\s+/, ""));
      els.push(<ol key={key} className="my-4 list-decimal space-y-1.5 pl-6">{items.map((t, k) => <li key={k}>{inline(t, `${key}-${k}`)}</li>)}</ol>);
      continue;
    }
    const buf: string[] = [];
    while (i < L.length && L[i].trim() && !/^(#{1,4}\s|```|>|---+$|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(L[i])) buf.push(L[i++]);
    els.push(<p key={key} className="my-4 leading-relaxed">{inline(buf.join(" "), key)}</p>);
  }
  return <div className="text-slate">{els}</div>;
}
