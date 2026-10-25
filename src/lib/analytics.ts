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

export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href });
}

export function trackNodeClick(id: string, name: string) {
  window.gtag?.("event", "node_click", { node_id: id, node_name: name });
}
