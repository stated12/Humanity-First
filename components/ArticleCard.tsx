import Link from "next/link";
import { dateFmt } from "@/lib/format";
export default function ArticleCard({ a, big = false }: { a: any; big?: boolean }) {
  const cat = a.hc_categories?.name;
  return (<article className="card flex h-full flex-col p-5 transition hover:border-gold">
    {a.featured_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.featured_image} alt={a.image_alt || ""} className="mb-3 aspect-[16/9] w-full object-cover" loading="lazy" />}
    {cat && <p className="kicker">{cat}</p>}<h3 className={`mt-1 ${big ? "text-2xl" : "text-xl"}`}><Link href={`/articles/${a.slug}`} className="hover:underline">{a.title}</Link></h3>
    {a.excerpt && <p className="mt-2 line-clamp-4 text-sm text-muted">{a.excerpt}</p>}
    <p className="mt-auto pt-3 text-xs text-muted">{a.hc_authors?.name || "ORIVANA Editorial Team"}{a.published_at ? " · " + dateFmt(a.published_at) : ""}{a.reading_time ? ` · ${a.reading_time} min read` : ""}</p></article>);
}
