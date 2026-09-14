import { Router } from "express";

/**
 * Mount point for all future business endpoints (`/api/*`).
 * Intentionally empty in this foundation prompt: no auth, no DB, no
 * business routes yet. The terminal middleware below guarantees an
 * unknown `/api/*` route always answers JSON 404 and never falls through
 * to the SPA fallback.
 */
export function createApiRouter(): Router {
  const router = Router();

  router.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "API_NOT_FOUND",
        message: "Unknown API route",
      },
    });
  });

  return router;
}
