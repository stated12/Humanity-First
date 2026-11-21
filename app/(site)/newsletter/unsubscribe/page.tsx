import { db } from "@/lib/db";
export const metadata = { title: "Unsubscribe", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const sp = await searchParams; let ok = false;
  if (sp.t && /^[0-9a-f]{32}$/.test(sp.t)) { const { data } = await db().from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }).eq("token", sp.t).select("id"); ok = !!(data || []).length; }
  return <div className="narrow py-20 text-center"><h1 className="text-4xl">{ok ? "You are unsubscribed" : "Link not valid"}</h1><p className="mt-3 text-muted">{ok ? "You will no longer receive our newsletter." : "This link is invalid."}</p></div>;
}
