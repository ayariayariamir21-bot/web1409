import express, { type Express } from "express";
import path from "path";
import { createApiRouter } from "./api.js";
import { errorHandler } from "./errors.js";

/** Explicit JSON body limit: oversized payloads fail fast with 413. */
export const JSON_BODY_LIMIT = "100kb";

/**
 * Application bootstrap. Route order is load-bearing:
 *   1. JSON parsing (bounded) — before everything that reads bodies.
 *   2. System routes (`GET /health`).
 *   3. API router (`/api/*`, terminal JSON 404 inside).
 *   4. Static assets.
 *   5. SPA fallback (frontend routes only — never `/api/*`).
 *   6. Base error handler (last).
 */
export function createApp(staticPath: string): Express {
  const app = express();

  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use("/api", createApiRouter());

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes.
  // Unreachable for /api/*: the API router above always terminates them.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(errorHandler);

  return app;
}
