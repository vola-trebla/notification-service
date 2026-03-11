export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_MAX_ATTEMPTS = Number(process.env.DELIVERY_MAX_ATTEMPTS) || 5;
export const WORKER_POLL_MS = Number(process.env.WORKER_POLL_MS) || 1000;
export const BACKOFF_BASE_MS = Number(process.env.BACKOFF_BASE_MS) || 1000;
