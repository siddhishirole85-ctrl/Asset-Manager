import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@/lib/api-client-react";
import App from "./App";
import "./index.css";

const apiBase = import.meta.env.VITE_API_URL;
if (apiBase) {
  setBaseUrl(String(apiBase).replace(/\/+$/, ""));
}

if (import.meta.env.DEV) {
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const u =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : String(input);
      (window as unknown as { __LIBRARY_LAST_FETCH__?: string }).__LIBRARY_LAST_FETCH__ = u;
    } catch {
      /* ignore */
    }
    return orig(input, init);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
