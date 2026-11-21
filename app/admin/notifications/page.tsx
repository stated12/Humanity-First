import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { markNotifications } from "../ops";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("notifications.read");
  const { data, error } = await db().from("notifications").select("*").order("created_at", { ascending: false }).limit(300);
  const rows = data || [];
  return (<div className="max-w-4xl"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl">Notifications</h1><form action={markNotifications}><button className="btn btn-line" type="submit">Mark all as read</button></form></div>
    {error && <p className="card mt-4 p-4 text-red-700">Could not load notifications: {error.message}</p>}
    <div className="mt-4 space-y-3">{rows.map((n: any) => <article key={n.id} className={`card p-4 ${n.is_read ? "opacity-70" : "border-l-4 border-navy"}`}><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-semibold">{n.title}</h2><span className="text-xs text-muted">{n.is_read ? "Read" : "Unread"}</span></div>{n.body && <p className="mt-2 text-sm">{n.body}</p>}<p className="mt-2 text-xs text-muted">{n.kind} · {new Date(n.created_at).toLocaleString("en-IN")}</p>{n.link && <a className="mt-2 inline-block underline" href={n.link}>Open related item</a>}{!n.is_read && <form action={markNotifications} className="mt-3"><input type="hidden" name="id" value={n.id}/><button className="text-sm underline" type="submit">Mark as read</button></form>}</article>)}{!rows.length && !error && <div className="card p-6 text-center text-muted">No notifications yet.</div>}</div></div>);
}
