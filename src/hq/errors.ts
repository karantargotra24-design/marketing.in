/** Throw from an agent/runner/provider for failures worth retrying (timeouts, rate limits, 5xx). */
export class RecoverableError extends Error { readonly recoverable = true; }
