import { lookup } from "node:dns/promises";
import net from "node:net";

export type PageFacts = { url: string; finalUrl: string; status: number; fetchedAt: string; title: string | null; description: string | null; canonical: string | null; lang: string | null; h1: string[]; h2: string[]; linkCount: number; imageCount: number; imagesMissingAlt: number; hasJsonLd: boolean; robotsMeta: string | null; wordCount: number; ogTitle: string | null; textSample: string };
export type FetchOk = { ok: true; page: PageFacts };
export type FetchFail = { ok: false; error: string };

/** True for loopback, private, link-local (incl. cloud metadata 169.254.169.254), CGNAT, multicast, unspecified. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    if (l === "::1" || l === "::" || l.startsWith("fe8") || l.startsWith("fe9") || l.startsWith("fea") || l.startsWith("feb") || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("ff")) return true;
    const m = l.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/); return m ? isPrivateIp(m[1]) : false;
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((x) => Number.isNaN(x))) return true;
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || a >= 224;
}

export type Resolver = (host: string) => Promise<string[]>;
const defaultResolver: Resolver = async (h) => (await lookup(h, { all: true })).map((x) => x.address);

/** Rejects non-http(s), credentials in URL, and any hostname that resolves to a non-public address. */
export async function assertPublicUrl(raw: string, resolve: Resolver = defaultResolver): Promise<URL> {
  let u: URL; try { u = new URL(raw); } catch { throw new Error("Not a valid URL"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Only http(s) URLs can be fetched");
  if (u.username || u.password) throw new Error("URLs with credentials are not allowed");
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  // Defense in depth: block internal-looking names even before any DNS answer is trusted.
  if (!net.isIP(host) && (!host.includes(".") || host === "localhost" || /\.(localhost|local|internal|localdomain|lan|home|corp)$/.test(host))) throw new Error("Blocked: internal hostname");
  const addrs = net.isIP(host) ? [host] : await resolve(host).catch(() => { throw new Error("Hostname does not resolve"); });
  if (!addrs.length || addrs.some(isPrivateIp)) throw new Error("Blocked: address is not public");
  return u;
}

const strip = (s: string) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").replace(/&nbsp;|&amp;|&quot;|&#39;/g, " ").replace(/\s+/g, " ").trim();
const meta = (html: string, attr: string, name: string) => html.match(new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1] ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`, "i"))?.[1] ?? null;

export function parseHtml(html: string, url: string, finalUrl: string, status: number, fetchedAt: string): PageFacts {
  const text = strip(html);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  return {
    url, finalUrl, status, fetchedAt, title: strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") || null, description: meta(html, "name", "description"), ogTitle: meta(html, "property", "og:title"),
    canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null, lang: html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? null,
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1])).filter(Boolean).slice(0, 5), h2: [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1])).filter(Boolean).slice(0, 10),
    linkCount: (html.match(/<a\b/gi) ?? []).length, imageCount: imgs.length, imagesMissingAlt: imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length,
    hasJsonLd: /<script[^>]+application\/ld\+json/i.test(html), robotsMeta: meta(html, "name", "robots"), wordCount: text ? text.split(" ").length : 0, textSample: text.slice(0, 400),
  };
}

export type FetchOpts = { fetchImpl?: typeof fetch; resolver?: Resolver; timeoutMs?: number; maxBytes?: number; maxRedirects?: number };
/** Fetches ONE public web page for analysis. Each redirect hop is re-validated; size and time are capped; only HTML is accepted. */
export async function fetchPage(rawUrl: string, o: FetchOpts = {}): Promise<FetchOk | FetchFail> {
  const f = o.fetchImpl ?? fetch; let url = rawUrl; const max = o.maxBytes ?? 1_500_000;
  try {
    for (let hop = 0; hop <= (o.maxRedirects ?? 3); hop++) {
      const u = await assertPublicUrl(url, o.resolver);
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), o.timeoutMs ?? 8000);
      let res: Response;
      try { res = await f(u.toString(), { redirect: "manual", signal: ctrl.signal, headers: { "user-agent": "MarketingOS-Research/1.0", accept: "text/html" } }); } finally { clearTimeout(timer); }
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { url = new URL(res.headers.get("location")!, u).toString(); continue; }
      if (!/text\/html|application\/xhtml/i.test(res.headers.get("content-type") ?? "")) return { ok: false, error: `Not an HTML page (${res.headers.get("content-type") ?? "unknown type"})` };
      const len = Number(res.headers.get("content-length") ?? 0);
      if (len > max) return { ok: false, error: "Page is too large" };
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength > max) return { ok: false, error: "Page is too large" };
      return { ok: true, page: parseHtml(new TextDecoder().decode(buf), rawUrl, u.toString(), res.status, new Date().toISOString()) };
    }
    return { ok: false, error: "Too many redirects" };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Fetch failed" }; }
}

/** On-page SEO observations straight from the fetched page (no scores invented). */
export function pageObservations(p: PageFacts): string[] {
  const o: string[] = [];
  o.push(p.title ? `Title (${p.title.length} chars): "${p.title}"${p.title.length > 60 ? " — longer than ~60 chars, may truncate in search" : ""}` : "No <title> found");
  o.push(p.description ? `Meta description (${p.description.length} chars) present` : "No meta description");
  o.push(p.h1.length === 1 ? `One H1: "${p.h1[0]}"` : p.h1.length === 0 ? "No H1 heading" : `${p.h1.length} H1 headings (best practice: one)`);
  if (p.imageCount) o.push(`${p.imagesMissingAlt} of ${p.imageCount} images have no alt text`);
  o.push(p.hasJsonLd ? "Structured data (JSON-LD) present" : "No structured data (JSON-LD) found");
  if (!p.canonical) o.push("No canonical link"); if (!p.lang) o.push("No lang attribute on <html>");
  if (p.robotsMeta && /noindex/i.test(p.robotsMeta)) o.push("robots meta says noindex: page will not be indexed");
  o.push(`~${p.wordCount} words of visible text, ${p.linkCount} links`);
  return o;
}

/* ---------- web search (adapter exists; needs BRAVE_SEARCH_API_KEY; NOT tested against the real service) ---------- */
export type SearchHit = { title: string; url: string; snippet: string };
export async function braveSearch(query: string, key: string, count = 5, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; hits: SearchHit[]; at: string } | FetchFail> {
  try {
    const r = await fetchImpl(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`, { headers: { accept: "application/json", "x-subscription-token": key } });
    if (!r.ok) return { ok: false, error: `Search provider error ${r.status}` };
    const d = (await r.json()) as { web?: { results?: { title: string; url: string; description?: string }[] } };
    return { ok: true, at: new Date().toISOString(), hits: (d.web?.results ?? []).map((x) => ({ title: x.title, url: x.url, snippet: (x.description ?? "").replace(/<[^>]+>/g, "") })) };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Search failed" }; }
}
