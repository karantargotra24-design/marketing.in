import type { Db } from "./pgStore";

/** Production connection: node-postgres pool. Lazy import so builds without a database never load `pg`. */
export function pgPoolDb(connectionString: string): Db {
  let pool: import("pg").Pool | undefined;
  const get = async () => (pool ??= new (await import("pg")).Pool({ connectionString, max: 5, ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? undefined : { rejectUnauthorized: false } }));
  const wrap = (c: { query: (s: string, p?: unknown[]) => Promise<unknown> }): Db => ({
    query: async (sql, params) => { const r = (await c.query(sql, params)) as { rows: unknown[]; rowCount?: number }; return { rows: r.rows as never[], rowCount: r.rowCount }; },
    tx: () => { throw new Error("nested transaction"); },
  });
  return {
    query: async (sql, params) => (await get()).query(sql, params) as never,
    tx: async (fn) => {
      const client = await (await get()).connect();
      try { await client.query("begin"); const r = await fn(wrap(client)); await client.query("commit"); return r; }
      catch (e) { await client.query("rollback").catch(() => undefined); throw e; }
      finally { client.release(); }
    },
  };
}
