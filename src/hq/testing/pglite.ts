import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Db } from "../pgStore";

const SUPABASE_STUBS = `
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role anon nologin; create role authenticated nologin;
grant usage on schema auth to anon, authenticated;
`;

export function asDb(p: { query: PGlite["query"]; transaction: PGlite["transaction"] }): Db {
  return {
    query: async (sql, params) => { const r = await p.query(sql, params as never[]); return { rows: r.rows as never[], rowCount: r.affectedRows }; },
    tx: (fn) => p.transaction((t) => fn({ query: async (s, pr) => { const r = await t.query(s, pr as never[]); return { rows: r.rows as never[], rowCount: r.affectedRows }; }, tx: () => { throw new Error("nested"); } })),
  };
}

/** Real Postgres (WASM) with Supabase auth stubs and ALL repo migrations applied in order. */
export async function freshDatabase() {
  const pg = new PGlite();
  await pg.exec(SUPABASE_STUBS);
  const dir = path.join(process.cwd(), "supabase", "migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) await pg.exec(readFileSync(path.join(dir, f), "utf8"));
  return { pg, db: asDb(pg) };
}

export async function makeAgency(pg: PGlite, name: string) {
  const { rows } = await pg.query<{ id: string }>("insert into agency.agencies (name) values ($1) returning id", [name]);
  return rows[0].id;
}
export async function makeStaff(pg: PGlite, agencyId: string, role: "owner" | "member" | "client") {
  const { rows } = await pg.query<{ id: string }>("insert into auth.users (id) values (gen_random_uuid()) returning id");
  await pg.query("insert into agency.profiles (id, agency_id, role) values ($1,$2,$3)", [rows[0].id, agencyId, role]);
  return rows[0].id;
}
