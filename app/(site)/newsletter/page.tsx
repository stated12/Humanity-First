import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import NewsletterForm from "@/components/NewsletterForm";
export async function generateMetadata() { return pageMeta("/newsletter", { title: "Newsletter" }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ nl?: string }> }) { const sp = await searchParams; return (<><PageHead kicker="Newsletter" title="New articles and webinars, by email" intro="Free. We only send what you agreed to, and every email has an unsubscribe link." /><div className="wrap max-w-xl py-10"><NewsletterForm ret="/newsletter" status={sp.nl} /></div></>); }
