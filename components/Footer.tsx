import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getNav } from "@/lib/content";
import NewsletterForm from "./NewsletterForm";
export default async function Footer() {
  const [s, nav] = await Promise.all([getSettings(), getNav("footer")]);
  const social: [string, string][] = [["Instagram", s.social_instagram], ["Facebook", s.social_facebook], ["X", s.social_x], ["LinkedIn", s.social_linkedin], ["YouTube", s.social_youtube]];
  return (<footer className="mt-16 bg-navy text-white no-print"><div className="wrap grid gap-10 py-12 md:grid-cols-3">
    <div className="flex items-start gap-4">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/orivana-logo.png" alt="ORIVANA" width={72} height={72} className="h-16 w-16 rounded bg-white p-1" />{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/humanity-movement-logo.png" alt="The Humanity Movement" width={110} height={78} className="h-14 w-auto rounded bg-white p-1" /></div>
    <div className="md:col-span-2 md:-mt-0"><p className="font-serif text-lg">{s.brand_tagline}</p><p className="mt-1 text-sm text-white/75">{s.footer_note}</p></div>
    <div><h2 className="font-serif text-xl !text-white">Explore</h2><ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">{nav.map((i: any) => <li key={i.id}><Link href={i.href} className="hover:text-gold">{i.label}</Link></li>)}</ul></div>
    <div><h2 className="font-serif text-xl !text-white">Stay in touch</h2><p className="mt-2 text-sm text-white/75">New articles, webinars and tools. Free, and you can unsubscribe at any time.</p><div className="mt-3"><NewsletterForm ret="/" dark /></div></div>
    <div className="text-sm text-white/75"><h2 className="font-serif text-xl !text-white">Contact</h2>{s.contact_email && <p className="mt-2">{s.contact_email}</p>}{s.contact_phone && <p>{s.contact_phone}</p>}{s.contact_address && <p>{s.contact_address}</p>}<p className="mt-2"><Link href="/contact" className="underline">Contact form</Link></p>
      <div className="mt-3 flex flex-wrap gap-4">{social.filter(([, u]) => u).map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a>)}</div></div></div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-white/65"><div className="wrap flex flex-wrap items-center justify-center gap-x-4 gap-y-1"><span>© {new Date().getFullYear()} {s.legal_name || "The Humanity & Cooperation Initiative"}</span><Link href="/page/privacy-policy" className="underline">Privacy</Link><Link href="/page/terms" className="underline">Terms</Link><Link href="/page/editorial-policy" className="underline">Editorial policy</Link><Link href="/page/accessibility" className="underline">Accessibility</Link></div></div></footer>);
}
