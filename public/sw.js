/* STEMBridge caches only its anonymous public website shell. Account data,
   requests, API calls and external sites never enter these caches. */
const PREFIX = "stembridge-shell-v1-";
const META_CACHE = `${PREFIX}metadata`;
const FALLBACK_CACHE = `${PREFIX}fallback`;
const CURRENT = new URL("/__offline_current__", self.location.origin).href;
const ROOT = new URL("/", self.location.origin).href;
const FALLBACK = new URL("/offline.html", self.location.origin).href;
let preparation = null;

function staticAsset(value, base = ROOT) {
  try {
    const url = new URL(value.replaceAll("&amp;", "&"), base);
    if (url.origin !== self.location.origin || url.search || url.hash)
      return null;
    if (
      (url.pathname.startsWith("/_next/static/") &&
        /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|avif)$/.test(
          url.pathname,
        )) ||
      url.pathname === "/icon.svg" ||
      /^\/fonts\/[\w.-]+\.(?:woff2?|ttf|otf)$/.test(url.pathname)
    )
      return url.href;
  } catch {}
  return null;
}

async function publicFetch(url, html = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      headers: html ? { Accept: "text/html" } : undefined,
    });
    if (!response.ok || response.type === "opaque")
      throw new Error("Download failed");
    if (
      html &&
      (!response.headers.get("content-type")?.includes("text/html") ||
        response.headers.get("x-stembridge-offline") !== "public-shell")
    )
      throw new Error(
        "The public website is not available for offline use yet",
      );
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function currentBundle() {
  const metadata = await caches.open(META_CACHE);
  const stored = await metadata.match(CURRENT);
  if (!stored) return null;
  try {
    const bundle = await stored.json();
    if (
      !bundle.cache?.startsWith(`${PREFIX}build-`) ||
      !Array.isArray(bundle.assets) ||
      !bundle.assets.includes(ROOT)
    )
      return null;
    const cache = await caches.open(bundle.cache);
    const entries = await Promise.all(
      bundle.assets.map((asset) => cache.match(asset)),
    );
    return entries.every(Boolean) ? bundle : null;
  } catch {
    return null;
  }
}

async function prepareBundle() {
  const response = await publicFetch(ROOT, true);
  const html = await response.clone().text();
  const assets = new Set([new URL("/icon.svg", ROOT).href]);
  for (const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const asset = staticAsset(match[1]);
    if (asset) assets.add(asset);
  }
  if (
    ![...assets].some((asset) => asset.endsWith(".js")) ||
    ![...assets].some((asset) => asset.endsWith(".css"))
  ) {
    throw new Error("The website files are not ready to save");
  }
  // A complete anonymous HTML response identifies a build, including its inline
  // Next.js hydration data. Nothing is committed until every dependency exists.
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(html),
  );
  const fingerprint = [...new Uint8Array(digest)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
  const cacheName = `${PREFIX}build-${fingerprint}`;
  const cache = await caches.open(cacheName);
  try {
    const remaining = [...assets];
    const downloaded = new Set();
    while (remaining.length) {
      const batch = remaining.splice(0, 8);
      const results = await Promise.allSettled(
        batch.map(async (url) => {
          if (downloaded.has(url)) return;
          downloaded.add(url);
          const resource = await publicFetch(url);
          if (resource.headers.get("content-type")?.includes("text/html")) {
            throw new Error("A website file was not available");
          }
          if (url.endsWith(".css")) {
            const css = await resource.clone().text();
            for (const match of css.matchAll(
              /url\(\s*["']?([^\s"')]+)["']?\s*\)/gi,
            )) {
              const dependency = staticAsset(match[1], url);
              if (dependency && !assets.has(dependency)) {
                assets.add(dependency);
                remaining.push(dependency);
              }
            }
          }
          await cache.put(url, resource);
        }),
      );
      if (results.some((result) => result.status === "rejected")) {
        throw new Error("A website file could not be saved");
      }
    }
    await cache.put(ROOT, response);
    const bundle = {
      cache: cacheName,
      assets: [ROOT, ...assets],
      savedAt: Date.now(),
    };
    const entries = await Promise.all(
      bundle.assets.map((asset) => cache.match(asset)),
    );
    if (!entries.every(Boolean))
      throw new Error("Some website files could not be saved");
    const metadata = await caches.open(META_CACHE);
    await metadata.put(
      CURRENT,
      new Response(JSON.stringify(bundle), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    // Keep one preceding build for tabs still using it. Hashed assets cannot be
    // confused with the new build. Other apps' caches are never touched.
    const versions = (await caches.keys()).filter(
      (key) => key.startsWith(`${PREFIX}build-`) && key !== cacheName,
    );
    await Promise.all(versions.slice(0, -1).map((key) => caches.delete(key)));
    return bundle;
  } catch (error) {
    const previous = await currentBundle();
    if (previous?.cache !== cacheName) await caches.delete(cacheName);
    throw error;
  }
}

function prepare() {
  if (!preparation)
    preparation = prepareBundle().finally(() => {
      preparation = null;
    });
  return preparation;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const response = await publicFetch(FALLBACK);
      await (await caches.open(FALLBACK_CACHE)).put(FALLBACK, response);
    })(),
  );
  // Updated workers wait for old tabs to close; there is no forced mid-session swap.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (
    !event.source?.url ||
    new URL(event.source.url).origin !== self.location.origin
  )
    return;
  if (
    !event.ports[0] ||
    !["STEMBRIDGE_PREPARE", "STEMBRIDGE_STATUS"].includes(event.data?.type)
  )
    return;
  event.waitUntil(
    (async () => {
      try {
        const bundle =
          event.data.type === "STEMBRIDGE_PREPARE"
            ? await prepare()
            : await currentBundle();
        event.ports[0].postMessage({
          ready: Boolean(bundle),
          savedAt: bundle?.savedAt ?? null,
        });
      } catch {
        const bundle = await currentBundle().catch(() => null);
        event.ports[0].postMessage({
          ready: Boolean(bundle),
          error:
            "Could not finish saving the website. Reconnect and try again.",
        });
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Deliberately excludes API routes, auth callbacks, RSC fetches and all other
  // paths. Root query strings are client-side views of the same public shell.
  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) return response;
          throw new Error("Website unavailable");
        } catch {
          const bundle = await currentBundle();
          const saved =
            bundle && (await (await caches.open(bundle.cache)).match(ROOT));
          if (saved) return saved;
          return (
            (await (await caches.open(FALLBACK_CACHE)).match(FALLBACK)) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }
  const asset = staticAsset(url.href);
  if (!asset) return;
  event.respondWith(
    (async () => {
      const bundle = await currentBundle();
      const cached =
        bundle && (await (await caches.open(bundle.cache)).match(asset));
      if (cached) return cached;
      const oldBuilds = (await caches.keys()).filter((key) =>
        key.startsWith(`${PREFIX}build-`),
      );
      for (const name of oldBuilds) {
        const oldAsset = await (await caches.open(name)).match(asset);
        if (oldAsset) return oldAsset;
      }
      // Do not grow an unverified runtime cache. Only prepare() commits resources.
      return fetch(request);
    })(),
  );
});
