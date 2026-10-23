export type AppMode = "mock" | "real";

/** Defaults to "mock" so nothing is ever treated as connected by accident. */
export function getAppMode(value: string | undefined = process.env.APP_MODE): AppMode {
  return value === "real" ? "real" : "mock";
}
