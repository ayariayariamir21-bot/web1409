/**
 * Characterization + contract tests for server environment configuration.
 *
 * Covers: valid config, missing required var, invalid type, dev/test/prod
 * modes, no secrets in bundle, no secrets in logs, /health and /api/*
 * compatibility. Pure `loadServerConfig(env)` calls keep tests independent
 * of execution order and of the real process environment.
 */
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import {
  ConfigError,
  DEV_FALLBACK_SESSION_SECRET,
  loadServerConfig,
} from "./config.js";

const PROD_SECRET = "0123456789abcdef0123456789abcdef";

function baseEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: "production",
    PORT: "4001",
    DATABASE_URL: "postgresql://user:password@localhost:5432/web1409",
    SESSION_SECRET: PROD_SECRET,
    BUILT_IN_FORGE_API_URL: "",
    BUILT_IN_FORGE_API_KEY: "",
  };
}

describe("server configuration", () => {
  it("1. accepts a complete valid configuration", () => {
    const config = loadServerConfig(baseEnv());

    expect(config).toEqual({
      nodeEnv: "production",
      port: 4001,
      databaseUrl: "postgresql://user:password@localhost:5432/web1409",
      sessionSecret: PROD_SECRET,
      forgeApiUrl: undefined,
      forgeApiKey: undefined,
    });
  });

  it("2. fails fast naming the missing required variable", () => {
    const env = baseEnv();
    delete env.SESSION_SECRET;

    let thrown: unknown;
    try {
      loadServerConfig({ ...env, NODE_ENV: "production" });
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ConfigError);
    expect((thrown as ConfigError).vars).toEqual(["SESSION_SECRET"]);
  });

  it("3. rejects a non-numeric port without leaking values", () => {
    let thrown: unknown;
    try {
      loadServerConfig({ ...baseEnv(), PORT: "not-a-port" });
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ConfigError);
    expect((thrown as ConfigError).vars).toEqual(["PORT"]);
  });

  it("4. development uses documented test values only", () => {
    const config = loadServerConfig({ NODE_ENV: "development" });

    expect(config.nodeEnv).toBe("development");
    expect(config.port).toBe(3000);
    expect(config.sessionSecret).toBe(DEV_FALLBACK_SESSION_SECRET);
    expect(config.databaseUrl).toBeUndefined();
  });

  it("5. test mode never fail-fasts on secrets", () => {
    const config = loadServerConfig({ NODE_ENV: "test", PORT: "5001" });

    expect(config.nodeEnv).toBe("test");
    expect(config.port).toBe(5001);
    expect(config.sessionSecret).toBe(DEV_FALLBACK_SESSION_SECRET);
  });

  it("6. production accepts explicit values and rejects short secrets", () => {
    expect(loadServerConfig(baseEnv()).nodeEnv).toBe("production");

    let thrown: unknown;
    try {
      loadServerConfig({ ...baseEnv(), SESSION_SECRET: "too-short" });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(ConfigError);
  });

  it("7. no server secret names leak into client sources or .env.example values", () => {
    const forbidden = /SESSION_SECRET|DATABASE_URL|BUILT_IN_FORGE_API_KEY/;
    const hits: string[] = [];

    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (/\.(ts|tsx)$/.test(entry)) {
          if (forbidden.test(readFileSync(full, "utf8"))) hits.push(full);
        }
      }
    };
    walk(path.resolve("client/src"));
    expect(hits).toEqual([]);

    const example = readFileSync(path.resolve(".env.example"), "utf8");
    expect(example).toMatch(/^SESSION_SECRET=$/m);
    expect(example).not.toMatch(/BEGIN .*PRIVATE KEY/);
  });

  it("8. configuration errors never carry secret values", () => {
    const sentinel = "sentinel-secret-value-9f8e7d6c5b4a";
    let message = "";
    try {
      loadServerConfig({
        NODE_ENV: "production",
        PORT: "bogus",
        SESSION_SECRET: sentinel,
      });
    } catch (err) {
      message = String(err);
    }

    expect(message).toContain("PORT");
    expect(message).not.toContain(sentinel);
  });

  it("9. configured server still answers GET /health", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "web1409-health-"));
    try {
      writeFileSync(path.join(dir, "index.html"), '<div id="root"></div>');
      const app = createApp(dir);
      const server = createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      try {
        const { port } = server.address() as AddressInfo;
        const res = await fetch(`http://127.0.0.1:${port}/health`);
        const body = (await res.json()) as Record<string, unknown>;
        expect(res.status).toBe(200);
        expect(body.status).toBe("ok");
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("10. configured server keeps /api/* on JSON 404", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "web1409-api-"));
    try {
      writeFileSync(path.join(dir, "index.html"), '<div id="root"></div>');
      const app = createApp(dir);
      const server = createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      try {
        const { port } = server.address() as AddressInfo;
        const res = await fetch(`http://127.0.0.1:${port}/api/unknown-route`);
        const body = (await res.json()) as {
          error?: { code?: string };
        };
        expect(res.status).toBe(404);
        expect(body.error?.code).toBe("API_NOT_FOUND");
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
