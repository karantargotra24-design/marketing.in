# ScapeMedia Agency OS

AI-powered social media agency dashboard. **Early setup stage (Phase 0): nothing is connected, all data is mock.**
Plan: [docs/ARCHITECTURE_PLAN.md](docs/ARCHITECTURE_PLAN.md)

## Run it (beginner steps)
1. Install Node.js 20 or newer from https://nodejs.org (choose "LTS").
2. Open a terminal in this folder and run: `npm install`
3. Start the app: `npm run dev`
4. Open http://localhost:3000 to see the portfolio website. The old "Setup OK" status page is now at http://localhost:3000/setup.

No accounts, API keys or passwords are needed in this phase.

## Useful commands
| Command | What it does |
|---|---|
| `npm run dev` | Start the app locally |
| `npm test` | Run automated tests |
| `npm run lint` | Check code style |
| `npm run typecheck` | Check for type mistakes |
| `npm run build` | Make a production build |

## Secrets
Copy `.env.example` to `.env.local` when keys are needed (later phases). `.env.local` is git-ignored. Never paste keys into code or chat.

## Folder map
`src/app` pages · `src/ui` components · `src/services` business rules · `src/db` database · `src/agents` AI agents · `src/integrations` outside services

## Phase 1: login and clients (needs Supabase)
1. Supabase dashboard → **Project Settings → API → Exposed schemas** → add `agency`.
2. Supabase dashboard → **Authentication → Users → Add user**: your email + a password (8+ characters). Tick "Auto confirm".
3. Tell Claude your email. It links that login to the "ScapeMedia" agency as **owner** (only the owner can do this step, there is no public sign-up).
4. Create `.env.local` from `.env.example` and set `APP_MODE=real`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both safe to expose; they are in Supabase → Settings → API).
5. `npm run dev`, open `/login`.

Without those keys the app stays in **MOCK mode** and shows example clients that are not saved.
Note: this Supabase project is shared with the Academy app, so Academy students can create logins too. They cannot see anything in Agency OS because they have no agency profile.

## Portfolio website (public, at `/`)
Animated agency portfolio: Next.js + Tailwind + Framer Motion + GSAP ScrollTrigger + Lenis smooth scroll + Lucide icons.

| What to change | File |
|---|---|
| Name, email, phone, WhatsApp number, social links, brand colours | `src/portfolio/brand.ts` (+ colour tokens at the top of `src/app/globals.css`) |
| Projects, case studies, services, stats, process steps | `src/portfolio/data.ts` |
| Project videos | Put an `.mp4` in `public/work/` and set `video: "/work/name.mp4"` on the project. It loads only when the card is on screen. |

Pages: `/` (home) and `/work/<project-slug>` (one case study per project, built automatically from `data.ts`).

**Before publishing:** all project numbers, client descriptions and contact details in `data.ts` / `brand.ts` are sample placeholders. Replace them with your real, client-approved figures.
