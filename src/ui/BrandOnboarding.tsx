"use client";

import { useState } from "react";
import { brandFromForm, tones, type SavedBrand } from "@/services/brandProfile";
import { BRANDS_KEY, SEED_BRANDS } from "./brands";
import { useMockList } from "./useMockList";

const field = "rounded-lg border border-slate-300 bg-white p-3 text-base";
const label = "flex flex-col gap-1 text-sm font-medium";

export function BrandOnboarding() {
  const [brands, saveBrands] = useMockList<SavedBrand>(BRANDS_KEY, SEED_BRANDS);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = brandFromForm(new FormData(e.currentTarget));
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError("");
    saveBrands([{ ...parsed.data, id: crypto.randomUUID() }, ...brands]);
    setFormKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
        <b>MOCK.</b> Profiles are saved only in this browser. Names marked (example) are made up.
      </p>

      <form key={formKey} onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <h2 className="font-semibold">Onboard a client</h2>
        <label className={label}>Client name<input name="name" required maxLength={120} className={field} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Industry<input name="industry" maxLength={80} className={field} /></label>
          <label className={label}>City<input name="city" maxLength={80} className={field} /></label>
        </div>
        <label className={label}>Who are their customers?<textarea name="audience" maxLength={300} rows={2} className={field} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Tone<select name="tone" className={field}>{tones.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className={label}>Language<select name="language" className={field}><option value="hinglish">Hinglish</option><option value="english">English</option></select></label>
        </div>
        <label className={label}>What makes them special? (one per line)<textarea name="usps" rows={2} className={field} /></label>
        <label className={label}>Never say (one per line)<textarea name="doNot" rows={2} placeholder="fixed price&#10;guaranteed" className={field} /></label>
        <label className={label}>Competitors (one per line)<textarea name="competitors" rows={2} className={field} /></label>
        <label className={label}>Main goal<input name="goal" maxLength={300} placeholder="e.g. More showroom visits" className={field} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Leads wanted / month<input name="monthlyLeadTarget" type="number" min={0} inputMode="numeric" className={field} /></label>
          <label className={label}>Brand colors<input name="brandColors" placeholder="#C2410C, #1B2430" className={field} /></label>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="rounded-lg bg-slate-900 p-3 font-semibold text-white">Save client profile</button>
      </form>

      <section aria-labelledby="saved">
        <h2 id="saved" className="mb-2 font-semibold">Saved profiles</h2>
        <ul className="flex flex-col gap-2">
          {brands.map((b) => (
            <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <b className="break-words">{b.name}</b>
                <button onClick={() => saveBrands(brands.filter((x) => x.id !== b.id))} className="shrink-0 text-xs underline" aria-label={`Remove ${b.name}`}>Remove</button>
              </div>
              <p className="text-slate-600">{[b.industry, b.city].filter(Boolean).join(" · ")} · {b.tone} · {b.language}</p>
              {b.goal && <p>Goal: {b.goal}{b.monthlyLeadTarget ? ` (${b.monthlyLeadTarget} leads/month)` : ""}</p>}
              {b.doNot.length > 0 && <p className="text-red-800">Never say: {b.doNot.join(", ")}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
