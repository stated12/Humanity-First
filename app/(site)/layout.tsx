import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Consent from "@/components/Consent";
import JsonLd from "@/components/JsonLd";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const org = { "@context": "https://schema.org", "@type": "Organization", name: s.initiative_name || "The Humanity & Cooperation Initiative", parentOrganization: { "@type": "Organization", name: "ORIVANA" }, url: SITE_URL, logo: `${SITE_URL}/brand/orivana-logo.png`, sameAs: [s.social_instagram, s.social_facebook, s.social_x, s.social_linkedin, s.social_youtube].filter(Boolean) };
  return (<><JsonLd data={org} /><Header /><main id="main" className="min-h-[60vh]">{children}</main><Footer /><Consent ga4={typeof s.ga4_id === "string" ? s.ga4_id : ""} /></>);
}
