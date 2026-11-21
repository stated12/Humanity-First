import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
export async function generateMetadata() { return pageMeta("/contact", { title: "Contact" }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const s = await getSettings();
  return (<><PageHead kicker="Contact" title="Get in touch"><div className="mb-4"><Breadcrumbs items={[{ name: "Contact" }]} /></div></PageHead><div className="wrap grid gap-10 py-10 md:grid-cols-[1fr_420px]"><div className="space-y-2">{s.contact_email && <p><b>Email:</b> {s.contact_email}</p>}{s.contact_phone && <p><b>Phone:</b> {s.contact_phone}</p>}{s.contact_address && <p><b>Address:</b> {s.contact_address}</p>}{!s.contact_email && !s.contact_phone && !s.contact_address && <p className="text-muted">Use the form to reach us.</p>}</div><FormBox formKey="contact" ret="/contact" sent={sp.sent} /></div></>);
}
