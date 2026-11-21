"use client";
import { useEffect, useState } from "react";
/** Loads Google Analytics only after the visitor accepts. Renders nothing when no GA4 id is configured. */
export default function Consent({ ga4 }: { ga4: string }) {
  const [state, setState] = useState<"unknown" | "yes" | "no">("unknown");
  useEffect(() => { try { const v = localStorage.getItem("hc_consent"); if (v === "yes" || v === "no") setState(v); } catch { /* ignore */ } }, []);
  useEffect(() => {
    if (state !== "yes" || !/^G-[A-Z0-9]+$/.test(ga4)) return;
    const s = document.createElement("script"); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`; document.head.appendChild(s);
    const w = window as any; w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments); }; w.gtag("js", new Date()); w.gtag("config", ga4);
  }, [state, ga4]);
  if (!ga4 || state !== "unknown") return null;
  const set = (v: "yes" | "no") => { try { localStorage.setItem("hc_consent", v); } catch { /* ignore */ } setState(v); };
  return (<div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-4 shadow-lg no-print"><div className="wrap flex flex-wrap items-center justify-between gap-3 text-sm">
    <p className="max-w-3xl">We use optional analytics cookies to understand readership. Essential cookies (sign-in, language) are always used. <a className="underline" href="/page/cookie-policy">Cookie policy</a></p>
    <div className="flex gap-2"><button onClick={() => set("no")} className="btn btn-line !py-2">Decline</button><button onClick={() => set("yes")} className="btn btn-dark !py-2">Accept</button></div></div></div>);
}
