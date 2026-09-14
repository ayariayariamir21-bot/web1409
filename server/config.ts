/**
 * Typed server configuration.
 *
 * SCOPE: environment parsing and validation only. No authentication, no
 * database connection, no business logic. Secrets stay server-side:
 * nothing exported here may be imported by `client/**` (enforced by
 * `server/config.test.ts`).
 */

export type NodeEnv = "development" | "test" | "production";

export type ServerConfig = {
  /** Runtime mode. Defaults to `development` when unset. */
  nodeEnv: NodeEnv;
  /** TCP port. Defaults to `3000` when unset. */
  port: number;
  /**
   * Future database connection string. Documented and validated as a
   * non-empty string only; no connection is opened by this module.
   */
  databaseUrl?: string;
  /**
   * Future opaque-session secret. REQUIRED in production (fail-fast).
   * In development/test an explicit documented test value is used —
   * see DEV_FALLBACK_SESSION_SECRET.
   */
  sessionSecret: string;
  /** Pre-existing dev storage-proxy base URL (logic untouched). */
  forgeApiUrl?: string;
  /** Pre-existing dev storage-proxy key. Never logged, never served. */
  forgeApiKey?: string;
};

/**
 * Development/test fallback ONLY. Hard-coded so it can never be mistaken
 * for a real secret, and rejected in production by fail-fast validation.
 */
export const DEV_FALLBACK_SESSION_SECRET =
  "dev-only-insecure-secret-do-not-use-in-production";

const MIN_PROD_SESSION_SECRET_LENGTH = 32;

/**
 * Configuration errors name the offending VARIABLE ONLY — never its value.
 */
export class ConfigError extends Error {
  readonly vars: string[];

  constructor(vars: string[], detail: string) {
    super(`Invalid server configuration: ${vars.join(", ")} (${detail})`);
    this.name = "ConfigError";
    this.vars = vars;
  }
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseNodeEnv(raw: string | undefined): NodeEnv {
  const value = raw?.trim() || "development";
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }
  throw new ConfigError(
    ["NODE_ENV"],
    "must be one of development, test, production",
  );
}

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") {
    return 3000;
  }
  const parsed = Number(raw.trim());
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new ConfigError(
      ["PORT"],
      "must be an integer between 1 and 65535",
    );
  }
  return parsed;
}

/**
 * Load and validate server configuration. Pure function of the given env
 * mapping (defaults to `process.env`) so it is unit-testable without
 * mutating the real environment.
 *
 * Fail-fast: throws ConfigError in production when a required variable is
 * missing or invalid. Call once at startup, before listening.
 */
export function loadServerConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const nodeEnv = parseNodeEnv(env.NODE_ENV);
  const port = parsePort(env.PORT);
  const databaseUrl = emptyToUndefined(env.DATABASE_URL);

  let sessionSecret = emptyToUndefined(env.SESSION_SECRET);
  if (!sessionSecret) {
    if (nodeEnv === "production") {
      throw new ConfigError(
        ["SESSION_SECRET"],
        "required in production; set a random value of at least 32 characters",
      );
    }
    sessionSecret = DEV_FALLBACK_SESSION_SECRET;
  } else if (nodeEnv === "production" && sessionSecret.length < 32) {
    throw new ConfigError(
      ["SESSION_SECRET"],
      "must be at least 32 characters in production",
    );
  }

  return {
    nodeEnv,
    port,
    databaseUrl,
    sessionSecret,
    forgeApiUrl: emptyToUndefined(env.BUILT_IN_FORGE_API_URL),
    forgeApiKey: emptyToUndefined(env.BUILT_IN_FORGE_API_KEY),
  };
}
