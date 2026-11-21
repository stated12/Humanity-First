import { requirePerm } from "@/lib/auth";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("settings.write");
  return (<div className="max-w-3xl space-y-5"><h1 className="text-3xl">Load starter content</h1>
    <div className="card border-l-4 border-gold p-5"><h2 className="text-xl font-semibold">Database starter content is loaded through Supabase SQL</h2><p className="mt-2 text-sm">This project’s starter-content loader is a set of SQL seed scripts, not an automatic browser-side action. Run the scripts below in the Supabase SQL Editor in the documented order. They are designed to be re-run safely.</p></div>
    <section className="card p-5"><h2 className="text-lg font-semibold">Setup order</h2><ol className="mt-3 list-decimal space-y-2 pl-5"><li>Run <code>supabase/01_schema.sql</code></li><li>Run <code>supabase/02_functions.sql</code></li><li>Run <code>supabase/03_rls.sql</code></li><li>Run starter content: <code>supabase/seed_parts/04_01.sql</code> through <code>04_11.sql</code>, in order (or the single <code>supabase/04_seed.sql</code> file on desktop).</li><li>Run <code>supabase/06_grants.sql</code></li><li>Run the private <code>05_admin_user_PRIVATE.sql</code> script to provision the first Super Admin if not already done.</li></ol></section>
    <section className="card p-5"><h2 className="text-lg font-semibold">Starter content includes</h2><ul className="mt-3 list-disc space-y-1 pl-5"><li>Roles and permissions</li><li>Website settings and navigation</li><li>Academy topics and articles</li><li>Toolkit resources and categories</li><li>Programmes, Circle content and forms</li><li>Starter pages and related site content</li></ul></section>
    <section className="card p-5"><h2 className="text-lg font-semibold">After the SQL scripts run</h2><p className="mt-2">Refresh the admin dashboard and public site. Confirm that the articles, Academy topics, toolkit, programmes and navigation appear.</p><div className="mt-4 flex flex-wrap gap-3"><Link className="btn btn-dark" href="/admin">Back to Admin dashboard</Link><Link className="btn btn-line" href="/admin/settings">Website settings</Link></div></section>
    <p className="text-sm text-muted">This page is a setup guide and does not execute SQL or expose database credentials. Use the SQL Editor in the Supabase project connected to this website.</p>
  </div>);
}
