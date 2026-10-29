import { Routes } from "@/lib/routes";
import { trackEvent } from "./tracking.functions";

// Google Analytics 4 (public measurement ID — safe in browser code).
export const GA_ID = "G-ZQHGE29VD1";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

export function initAnalytics() {
  if (typeof window === "undefined" || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

const device = () => (window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");

// Anonymous random ids: visitor = per browser (persists), session = per tab session.
function anonId(store: Storage | undefined, key: string) {
  try {
    if (!store) return undefined;
    let v = store.getItem(key);
    if (!v) {
      v = crypto.randomUUID();
      store.setItem(key, v);
    }
    return v;
  } catch {
    return undefined;
  }
}

function internal(data: { kind: string; path?: string; nodeId?: string; nodeName?: string; label?: string }) {
  const visitorId = anonId(window.localStorage, "nodes-visitor");
  const sessionId = anonId(window.sessionStorage, "nodes-session");
  trackEvent({ data: { ...data, device: device(), visitorId, sessionId } }).catch(() => {});
}

// Counts clicks on buttons/links per page (skips /admin).
export function initClickTracking() {
  if (typeof window === "undefined") return () => {};
  const onClick = (e: MouseEvent) => {
    const path = window.location.pathname;
    if (path.startsWith(Routes.admin)) return;
    const el = (e.target as HTMLElement | null)?.closest("a,button,[role=button],input,select,label");
    if (!el) return;
    const label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 60);
    internal({ kind: "click", path, label });
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href });
  internal({ kind: "page_view", path });
}

export function trackNodeClick(id: string, name: string) {
  window.gtag?.("event", "node_click", { node_id: id, node_name: name });
  internal({ kind: "node_click", path: window.location.pathname, nodeId: id, nodeName: name });
}
