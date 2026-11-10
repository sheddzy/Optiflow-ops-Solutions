"use client";

import { useRef, useState } from "react";
import { uploadInlineImage } from "@/app/admin/blog/actions";

export function ArticleBodyEditor({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  async function addImage(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("Uploading image…");
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await uploadInlineImage(form);
      if (result.error || !result.url) {
        setMessage(result.error || "The image could not be uploaded.");
        return;
      }
      const name = file.name.replace(/\\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Article image";
      const field = textarea.current;
      const start = field?.selectionStart ?? value.length;
      const end = field?.selectionEnd ?? value.length;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const prefix = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      const suffix = after.length && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
      const insertion = `${prefix}![${name}](${result.url})${suffix}`;
      const next = before + insertion + after;
      setValue(next);
      setMessage("Image uploaded and inserted at the cursor position.");
      requestAnimationFrame(() => {
        if (!field) return;
        const pos = before.length + insertion.length;
        field.focus();
        field.setSelectionRange(pos, pos);
      });
    } catch {
      setMessage("The image could not be uploaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className={`btn btn-primary ${busy ? "pointer-events-none opacity-60" : ""} cursor-pointer`}>
          {busy ? "Uploading…" : "Add image at cursor"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              void addImage(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <span className="text-xs text-slate">Place your cursor where the image should appear, then upload. JPG, PNG or WebP, up to 4 MB.</span>
      </div>
      <textarea
        ref={textarea}
        id="body_md"
        name="body_md"
        rows={20}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="field w-full font-mono text-sm"
      />
      {message && <p role="status" className="text-xs text-slate">{message}</p>}
    </div>
  );
}
