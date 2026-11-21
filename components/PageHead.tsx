export default function PageHead({ kicker, title, intro, children }: { kicker?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (<div className="border-b border-line bg-soft"><div className="wrap py-10 md:py-14">{children}{kicker && <p className="kicker">{kicker}</p>}<h1 className="mt-1 max-w-3xl text-4xl md:text-5xl">{title}</h1>{intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}</div></div>);
}
