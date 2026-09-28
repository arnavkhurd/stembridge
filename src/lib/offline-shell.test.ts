import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";

const origin = "https://stembridge.test";
const source = readFileSync(
  new URL("../../public/sw.js", import.meta.url),
  "utf8",
);
type EventHandler = (event: Record<string, unknown>) => void;

function workerHarness() {
  const handlers: Record<string, EventHandler> = {};
  const storage = new Map<string, Map<string, Response>>();
  const calls: { url: string; options?: RequestInit }[] = [];
  let version = "a";
  let connected = true;
  let broken = "";
  let publicMarker = true;
  const cacheApi = {
    async open(name: string) {
      if (!storage.has(name)) storage.set(name, new Map());
      const entries = storage.get(name)!;
      return {
        async match(key: string) {
          return entries.get(key)?.clone();
        },
        async put(key: string, response: Response) {
          entries.set(key, response.clone());
        },
      };
    },
    async keys() {
      return [...storage.keys()];
    },
    async delete(key: string) {
      return storage.delete(key);
    },
  };
  const fetch = async (input: string | Request, options?: RequestInit) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ url, options });
    if (!connected || (broken && url.includes(broken)))
      throw new Error("Network unavailable");
    if (new URL(url).pathname === "/") {
      return new Response(
        `<html><link href="/_next/static/${version}.css" rel="stylesheet"><script src="/_next/static/${version}.js"></script></html>`,
        {
          headers: {
            "content-type": "text/html",
            ...(publicMarker ? { "x-stembridge-offline": "public-shell" } : {}),
          },
        },
      );
    }
    if (url.endsWith(".css"))
      return new Response(
        `body {font-family:Manrope} @font-face {src:url(./font.woff2)}`,
        { headers: { "content-type": "text/css" } },
      );
    return new Response("public static file", {
      headers: { "content-type": "application/octet-stream" },
    });
  };
  runInContext(
    source,
    createContext({
      self: {
        location: { origin },
        addEventListener: (type: string, fn: EventHandler) => {
          handlers[type] = fn;
        },
        clients: { claim: async () => {} },
      },
      caches: cacheApi,
      fetch,
      URL,
      Response,
      Request,
      TextEncoder,
      Uint8Array,
      crypto: webcrypto,
      AbortController,
      setTimeout,
      clearTimeout,
    }),
  );

  return {
    storage,
    calls,
    setConnected: (value: boolean) => {
      connected = value;
    },
    setVersion: (value: string) => {
      version = value;
    },
    setBroken: (value: string) => {
      broken = value;
    },
    setPublicMarker: (value: boolean) => {
      publicMarker = value;
    },
    async message(type = "STEMBRIDGE_PREPARE") {
      let result: { ready: boolean; error?: string } | undefined;
      let pending: Promise<void> | undefined;
      handlers.message({
        source: { url: `${origin}/` },
        data: { type },
        ports: [
          {
            postMessage: (reply: typeof result) => {
              result = reply;
            },
          },
        ],
        waitUntil: (promise: Promise<void>) => {
          pending = promise;
        },
      });
      await pending;
      return result!;
    },
    async install() {
      let pending: Promise<void> | undefined;
      handlers.install({
        waitUntil: (promise: Promise<void>) => {
          pending = promise;
        },
      });
      await pending;
    },
    async request(path: string, mode = "cors", method = "GET") {
      let pending: Promise<Response> | undefined;
      handlers.fetch({
        request: { url: new URL(path, origin).href, mode, method },
        respondWith: (promise: Promise<Response>) => {
          pending = promise;
        },
      });
      return pending
        ? { intercepted: true, response: await pending }
        : { intercepted: false, response: undefined };
    },
  };
}

describe("verified public offline website shell", () => {
  it("confirms ready only after HTML, JS, CSS, fonts and icon are cached anonymously", async () => {
    const worker = workerHarness();
    expect((await worker.message("STEMBRIDGE_STATUS")).ready).toBe(false);
    expect((await worker.message()).ready).toBe(true);
    const files = [...worker.storage.entries()].find(([key]) =>
      key.includes("build-"),
    )![1];
    expect([...files.keys()]).toEqual(
      expect.arrayContaining([
        `${origin}/`,
        `${origin}/_next/static/a.js`,
        `${origin}/_next/static/a.css`,
        `${origin}/_next/static/font.woff2`,
        `${origin}/icon.svg`,
      ]),
    );
    expect(
      worker.calls.every((call) => call.options?.credentials === "omit"),
    ).toBe(true);
    expect(
      worker.calls.every((call) => call.options?.cache === "no-store"),
    ).toBe(true);
  });

  it("does not intercept API, auth, external, RSC or write requests", async () => {
    const worker = workerHarness();
    for (const [url, mode, method] of [
      ["/api/profile", "cors", "GET"],
      ["/auth/callback", "navigate", "GET"],
      ["https://example.supabase.co/rest/v1/profiles", "cors", "GET"],
      ["/?_rsc=123", "cors", "GET"],
      ["/", "navigate", "POST"],
    ])
      expect((await worker.request(url, mode, method)).intercepted).toBe(false);
    expect(worker.calls).toHaveLength(0);
    expect(worker.storage.size).toBe(0);
  });

  it("reloads root query views and exact hashed assets offline from one complete build", async () => {
    const worker = workerHarness();
    await worker.message();
    worker.setConnected(false);
    const navigation = await worker.request("/?view=offline", "navigate");
    expect(await navigation.response!.text()).toContain("/_next/static/a.js");
    const script = await worker.request("/_next/static/a.js");
    expect(await script.response!.text()).toBe("public static file");
  });

  it("preserves the complete older build when a new download fails", async () => {
    const worker = workerHarness();
    await worker.message();
    worker.setVersion("b");
    worker.setBroken("b.js");
    const update = await worker.message();
    expect(update.ready).toBe(true);
    expect(update.error).toContain("Could not finish");
    worker.setConnected(false);
    expect(
      await (await worker.request("/", "navigate")).response!.text(),
    ).toContain("/_next/static/a.js");
    expect(
      [...worker.storage.keys()].filter((name) => name.includes("build-")),
    ).toHaveLength(1);
  });

  it("withdraws readiness if the browser evicts a required asset", async () => {
    const worker = workerHarness();
    await worker.message();
    const files = [...worker.storage.entries()].find(([key]) =>
      key.includes("build-"),
    )![1];
    files.delete(`${origin}/_next/static/a.js`);
    expect((await worker.message("STEMBRIDGE_STATUS")).ready).toBe(false);
  });

  it("rejects an unmarked server response and provides a public fallback when never prepared", async () => {
    const worker = workerHarness();
    await worker.install();
    worker.setPublicMarker(false);
    const reply = await worker.message();
    expect(reply.ready).toBe(false);
    expect(reply.error).toBeTruthy();
    worker.setConnected(false);
    expect(await (await worker.request("/", "navigate")).response!.text()).toBe(
      "public static file",
    );
    expect(
      [...worker.storage.keys()].filter((name) => name.includes("build-")),
    ).toHaveLength(0);
  });
});
