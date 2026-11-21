"use client";
import { useEffect } from "react";
/** First-party page-view beacon. No cookies, no IP stored; skipped when the browser sends Do Not Track. */
export default function Track({ articleId, path }: { articleId?: string; path: string }) {
  useEffect(() => {
    try { if (navigator.doNotTrack === "1") return; fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ a: articleId || null, p: path }), keepalive: true }).catch(() => {}); } catch { /* ignore */ }
  }, [articleId, path]);
  return null;
}
