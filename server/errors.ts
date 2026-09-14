import type { NextFunction, Request, Response } from "express";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Controlled application error. Carries the public HTTP status, a stable
 * machine-readable code and a safe message. Unknown errors never reuse
 * this path with attacker-controlled content.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = {
  error: {
    code: string;
    message: string;
    stack?: string;
  };
};

/**
 * Base error handler. Must be registered last, after routes and SPA
 * fallback. Never exposes stacks or environment values in production.
 * Framework errors that already carry a 4xx status (e.g. body-parser 413)
 * keep it; anything else becomes a generic 500.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const rawStatus = (err as { status?: unknown })?.status;
  const status =
    err instanceof ApiError
      ? err.status
      : typeof rawStatus === "number" &&
          Number.isInteger(rawStatus) &&
          rawStatus >= 400 &&
          rawStatus < 600
        ? rawStatus
        : 500;
  const code =
    err instanceof ApiError
      ? err.code
      : status === 413
        ? "PAYLOAD_TOO_LARGE"
        : "INTERNAL_ERROR";
  const message =
    err instanceof ApiError || status < 500 || !isProduction()
      ? (err as Error)?.message || "Internal server error"
      : "Internal server error";

  const body: ErrorBody = { error: { code, message } };
  if (!isProduction() && err instanceof Error && err.stack) {
    body.error.stack = err.stack;
  }

  if (!res.headersSent) {
    res.status(status).json(body);
    return;
  }
}
