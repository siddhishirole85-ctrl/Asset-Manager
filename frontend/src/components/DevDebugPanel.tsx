import { useEffect, useState } from "react";
import { fetchBackendJson, getApiBase } from "@/services/api.js";

type Health = {
  backend?: string;
  database?: string;
  frontend?: string;
};

export function DevDebugPanel() {
  const [health, setHealth] = useState<Health | null>(null);
  const [lastFetch, setLastFetch] = useState<string>("—");

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let alive = true;
    const tick = async () => {
      const { data } = await fetchBackendJson("/health");
      if (alive) setHealth(data as Health);
      try {
        const w = window as unknown as { __LIBRARY_LAST_FETCH__?: string };
        if (w.__LIBRARY_LAST_FETCH__) setLastFetch(w.__LIBRARY_LAST_FETCH__);
      } catch {
        /* ignore */
      }
    };
    tick();
    const id = window.setInterval(tick, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  const base = getApiBase() || "(VITE_API_URL not set)";
  const dbOk = health?.database === "connected";

  return (
    <div
      className="fixed bottom-1 right-1 z-[9999] max-w-[min(100vw-8px,320px)] rounded border border-dashed border-muted-foreground/40 bg-background/95 px-2 py-1 text-[10px] leading-tight text-muted-foreground shadow-sm backdrop-blur"
      aria-label="Developer debug panel"
    >
      <div className="font-mono text-[9px] opacity-80">dev debug</div>
      <div>API: {base}</div>
      <div>Backend: {health?.backend ?? "…"}</div>
      <div>DB: {health?.database ?? "…"}</div>
      <div>Frontend (server ping): {health?.frontend ?? "…"}</div>
      <div className="truncate" title={lastFetch}>
        Last fetch: {lastFetch}
      </div>
      <div>DB fetch OK: {dbOk ? "yes" : "no"}</div>
    </div>
  );
}
