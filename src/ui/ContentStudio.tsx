"use client";

import { useState } from "react";
import { runContentWriter } from "@/agents/contentWriter";
import type { ContentDraft } from "@/agents/contentWriter/schema";
import type { SavedBrand } from "@/services/brandProfile";
import { BRANDS_KEY, SEED_BRANDS } from "./brands";
import { useMockList } from "./useMockList";
import { labels, nextStatuses, humanOnly, transition, type ContentStatus } from "@/services/contentWorkflow";

type Item = {
  id: string;
  clientName: string;
  platform: string;
  format: string;
  topic: string;
  date: string;
  status: ContentStatus;
  draft: ContentDraft;
};

const KEY = "agency-os-mock-content-v1";
const today = () => new Date().toISOString().slice(0, 10);
const field = "rounded-lg border border-slate-300 bg-white p-3 text-base";

export function ContentStudio() {
  const [items, save] = useMockList<Item>(KEY, []);
  const [brands] = useMockList<SavedBrand>(BRANDS_KEY, SEED_BRANDS);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const client = brands[Number(f.get("client"))];
    if (!client) return setError("Add a client profile first (Onboarding).");
    setBusy(true);
    setError("");
    const result = await runContentWriter({
      clientName: client.name, industry: client.industry, city: client.city,
      platform: f.get("platform"), format: f.get("format"), topic: f.get("topic"),
      tone: client.tone, language: f.get("language"),
      brand: { usps: client.usps, doNot: client.doNot },
    });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    const item: Item = {
      id: crypto.randomUUID(), clientName: client.name, platform: String(f.get("platform")),
      format: String(f.get("format")), topic: String(f.get("topic")), date: String(f.get("date")),
      status: "draft", draft: result.draft,
    };
    save([item, ...items]);
    setOpen(item.id);
  }

  function move(id: string, to: ContentStatus) {
    const next = items.map((i) => (i.id === id ? { ...i, status: transition(i.status, to) } : i));
    save(next);
    setMessage(
      to === "ready_to_publish"
        ? "Marked ready. Nothing was posted. You post it manually."
        : `Moved to "${labels[to]}".`,
    );
  }

  const byDate = [...items].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
        <b>MOCK.</b> Drafts come from a template, not AI. They are saved only in this browser. Nothing is posted anywhere.
      </p>

      <form onSubmit={onGenerate} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <h2 className="font-semibold">New content</h2>
        <select name="client" aria-label="Client" className={field}>{brands.map((c, i) => <option key={c.id} value={i}>{c.name}</option>)}</select>
        <div className="grid grid-cols-2 gap-3">
          <select name="platform" aria-label="Platform" className={field}><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="google_business">Google Business</option></select>
          <select name="format" aria-label="Format" className={field}><option value="post">Post</option><option value="reel">Reel</option><option value="carousel">Carousel</option></select>
        </div>
        <input name="topic" required minLength={3} maxLength={200} placeholder="Topic, e.g. Diwali test drive" aria-label="Topic" className={field} />
        <div className="grid grid-cols-2 gap-3">
          <select name="language" aria-label="Language" defaultValue="hinglish" className={field}><option value="hinglish">Hinglish</option><option value="english">English</option></select>
          <input name="date" type="date" required defaultValue={today()} aria-label="Post date" className={field} />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="rounded-lg bg-slate-900 p-3 font-semibold text-white disabled:opacity-50">{busy ? "Writing…" : "Generate draft"}</button>
      </form>

      {message && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}

      <section aria-labelledby="cal">
        <h2 id="cal" className="mb-2 font-semibold">Calendar</h2>
        {byDate.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">No content yet. Generate your first draft above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {byDate.map((i) => (
              <li key={i.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id}>
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">{i.date} · {i.platform} · {i.format}</span>
                    <b className="block break-words">{i.topic}</b>
                    <span className="text-sm text-slate-600">{i.clientName}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">{labels[i.status]}</span>
                </button>
                {open === i.id && (
                  <div className="mt-3 flex flex-col gap-2 text-sm">
                    <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3">{i.draft.caption}</p>
                    <p className="text-slate-600">{i.draft.hashtags.join(" ")}</p>
                    {i.draft.script && <div><b>Script</b><ul className="list-disc pl-5">{i.draft.script.map((s) => <li key={s}>{s}</li>)}</ul></div>}
                    {i.draft.carouselSlides && <div><b>Slides</b><ol className="list-decimal pl-5">{i.draft.carouselSlides.map((s) => <li key={s}>{s}</li>)}</ol></div>}
                    {i.draft.editingNotes && <div><b>Editing notes</b><ul className="list-disc pl-5">{i.draft.editingNotes.map((s) => <li key={s}>{s}</li>)}</ul></div>}
                    <p><b>SEO:</b> {i.draft.seoTitle} · {i.draft.seoDescription}</p>
                    <p className="rounded-lg bg-amber-50 p-2"><b>Check before approving:</b> {i.draft.qaFlags.join("; ")}</p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses(i.status).map((to) => (
                        <button key={to} onClick={() => move(i.id, to)} className={`rounded-lg border px-3 py-2 font-semibold ${humanOnly.includes(to) ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white"}`}>
                          {to === "ready_to_publish" ? "Mark ready to post" : labels[to]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
