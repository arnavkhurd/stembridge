"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type OfflineState = {
  offline: boolean;
  ready: boolean;
  preparing: boolean;
  error: string | null;
  prepare: () => Promise<void>;
};
type WorkerReply = { ready: boolean; error?: string };

const OfflineContext = createContext<OfflineState>({
  offline: false,
  ready: false,
  preparing: false,
  error: null,
  prepare: async () => {},
});
const enabled =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_OFFLINE_DEV === "true";

function askWorker(worker: ServiceWorker, type: string): Promise<WorkerReply> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error("Saving took too long. Reconnect and try again."));
    }, 60000);
    channel.port1.onmessage = (event: MessageEvent<WorkerReply>) => {
      window.clearTimeout(timer);
      channel.port1.close();
      resolve(event.data);
    };
    worker.postMessage({ type }, [channel.port2]);
  });
}

async function activeWorker(): Promise<ServiceWorker> {
  // Looking up an existing registration is local. Do not attempt a worker
  // script update before using the already installed worker while offline.
  if (!navigator.onLine) {
    const existing = await navigator.serviceWorker.getRegistration("/");
    const installed = existing?.active ?? navigator.serviceWorker.controller;
    if (installed) return installed;
    throw new Error("Connect once to save this website for offline use.");
  }
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  if (registration.active) return registration.active;
  return new Promise((resolve, reject) => {
    const installing = registration.installing ?? registration.waiting;
    if (!installing) {
      reject(new Error("Offline support could not start."));
      return;
    }
    const timer = window.setTimeout(() => {
      installing.removeEventListener("statechange", changed);
      reject(new Error("Offline support could not start. Please try again."));
    }, 25000);
    function changed() {
      if (installing?.state === "activated") {
        window.clearTimeout(timer);
        installing.removeEventListener("statechange", changed);
        resolve(installing);
      } else if (installing?.state === "redundant") {
        window.clearTimeout(timer);
        installing.removeEventListener("statechange", changed);
        reject(new Error("Offline support could not start. Please try again."));
      }
    }
    installing.addEventListener("statechange", changed);
    changed();
  });
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const worker = useRef<Promise<ServiceWorker> | null>(null);
  const pending = useRef<Promise<void> | null>(null);
  const mounted = useRef(false);
  const getWorker = useCallback(() => {
    if (!worker.current)
      worker.current = activeWorker().catch((err) => {
        worker.current = null;
        throw err;
      });
    return worker.current;
  }, []);

  const prepare = useCallback(async () => {
    if (pending.current) return pending.current;
    if (!enabled) {
      setError(
        "Offline reload is available in the production website. Saved learning packs still work in this preview.",
      );
      return;
    }
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      setError(
        "This browser needs HTTPS or localhost to save the website for offline use.",
      );
      return;
    }
    pending.current = (async () => {
      setPreparing(true);
      setError(null);
      try {
        const serviceWorker = await getWorker();
        const existing = await askWorker(serviceWorker, "STEMBRIDGE_STATUS");
        if (mounted.current) setReady(existing.ready);
        if (!navigator.onLine) {
          if (!existing.ready)
            throw new Error(
              "Connect once to save this website for offline use.",
            );
          return;
        }
        const result = await askWorker(serviceWorker, "STEMBRIDGE_PREPARE");
        if (mounted.current) {
          setReady(result.ready);
          setError(
            result.error && result.ready
              ? "Using your saved offline copy. Could not check for updates; try again when connected."
              : (result.error ?? null),
          );
        }
      } catch (err) {
        if (mounted.current)
          setError(
            err instanceof Error
              ? err.message
              : "Could not save the website. Try again when connected.",
          );
      } finally {
        if (mounted.current) setPreparing(false);
        pending.current = null;
      }
    })();
    return pending.current;
  }, [getWorker]);

  useEffect(() => {
    mounted.current = true;
    const update = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine && enabled) void prepare();
    };
    setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (enabled) void prepare();
    return () => {
      mounted.current = false;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [prepare]);

  return (
    <OfflineContext.Provider
      value={{ offline, ready, preparing, error, prepare }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
