import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { currentUser } from "@/lib/supabase-server";
import { getNav } from "@/lib/content";
export default async function Header() {
  const [s, items, user] = await Promise.all([getSettings(), getNav("header"), currentUser()]);
  const main = items.slice(0, 7), more = items.slice(7);
  return (<header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur no-print">
    <div className="bg-navy text-[11px] text-white/85"><div className="wrap flex items-center justify-between py-1.5"><span className="truncate">{s.brand_tagline || "A Global Network for Peace, Education & Humanity"}</span><div className="flex shrink-0 items-center gap-4"><Link href="/search" className="hover:text-white">Search</Link><Link href={user ? "/account" : "/login"} className="hover:text-white">{user ? "Account" : "Sign in"}</Link><Link href="/support" className="font-semibold text-gold">Support</Link></div></div></div>
    <div className="wrap flex items-center justify-between gap-3 py-3">
      <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="The Humanity & Cooperation Initiative, home">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/orivana-logo.png" alt="ORIVANA" width={56} height={56} className="h-12 w-12 md:h-14 md:w-14" />
        <span className="min-w-0 leading-tight"><span className="block font-serif text-base font-semibold text-navy md:text-xl">The Humanity &amp; Cooperation Initiative</span><span className="block text-[10px] uppercase tracking-[.16em] text-muted md:text-[11px]">An ORIVANA initiative</span></span></Link>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/humanity-movement-logo.png" alt="The Humanity Movement" width={120} height={85} className="hidden h-12 w-auto md:block" /></div>
    <nav aria-label="Main" className="rule"><div className="wrap flex items-center gap-5 overflow-x-auto py-2.5 text-[13px] font-semibold">
      {main.map((i) => <Link key={i.id} href={i.href} className="whitespace-nowrap text-ink hover:text-gold-dark">{i.label}</Link>)}
      {more.length > 0 && <details className="relative"><summary className="cursor-pointer list-none whitespace-nowrap hover:text-gold-dark">More ▾</summary><div className="absolute right-0 top-8 z-50 min-w-52 border border-line bg-white p-2 shadow-lg">{more.map((i) => <Link key={i.id} href={i.href} className="block px-3 py-2 text-sm font-medium hover:bg-soft">{i.label}</Link>)}</div></details>}</div></nav></header>);
}
