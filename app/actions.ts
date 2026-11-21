"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authClient, currentUser } from "@/lib/supabase-server";
import { allow } from "@/lib/ratelimit";
import { SITE_URL, smtpConfigured } from "@/lib/env";
import { getSettings, bool } from "@/lib/settings";
import { mailVerify, sendMail, wrapMail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { uploadImage } from "@/lib/upload";
import { esc, slugify } from "@/lib/format";

const s = (fd: FormData, k: string, n = 300) => String(fd.get(k) ?? "").trim().slice(0, n);
const okEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e);
const safe = (n: string, d = "/") => (n.startsWith("/") && !n.startsWith("//") ? n : d);
const withQ = (p: string, q: string) => p + (p.includes("?") ? "&" : "?") + q;

export async function subscribeNewsletter(fd: FormData) {
  const ret = safe(s(fd, "ret"), "/"); const email = s(fd, "email", 120).toLowerCase();
  if (s(fd, "website") || !okEmail(email) || fd.get("consent") !== "on" || !(await allow("newsletter", 5, 600))) redirect(withQ(ret, "nl=err") + "#newsletter");
  const set = await getSettings(); const verify = bool(set.newsletter_require_verification) && smtpConfigured();
  const now = new Date().toISOString();
  const { data: ex } = await db().from("newsletter_subscribers").select("id,status,token").eq("email", email).maybeSingle();
  let token = ex?.token as string | undefined;
  if (ex) { if (ex.status !== "active") await db().from("newsletter_subscribers").update({ status: verify ? "pending" : "active", consent: true, consent_at: now, verified_at: verify ? null : now, unsubscribed_at: null }).eq("id", ex.id); }
  else { const r = await db().from("newsletter_subscribers").insert({ email, status: verify ? "pending" : "active", consent: true, consent_at: now, verified_at: verify ? null : now, source: s(fd, "source", 40) || "website" }).select("token").single(); token = r.data?.token; }
  if (verify && token) await mailVerify(email, token);
  redirect(withQ(ret, "nl=ok") + "#newsletter");
}

/** Generic configurable form (contact, circle application, youth interest, leadership enquiry, contributor application, sponsorship, story). */
export async function submitForm(fd: FormData) {
  const key = s(fd, "form_key", 60); const ret = safe(s(fd, "ret"), "/"); const bad = withQ(ret, "sent=err") + "#form";
  if (s(fd, "website") || !(await allow("form:" + key, 5, 900))) redirect(bad);
  const { data: f } = await db().from("forms").select("*").eq("key", key).eq("is_active", true).maybeSingle(); if (!f) redirect(bad);
  const data: Record<string, string> = {};
  for (const fld of (f.fields || []) as any[]) {
    const v = s(fd, "f_" + fld.name, fld.type === "textarea" ? 4000 : 300);
    if (fld.required && !v) redirect(bad);
    if (fld.type === "email" && v && !okEmail(v)) redirect(bad);
    if (v) data[fld.label || fld.name] = v;
  }
  const emailField = ((f.fields || []) as any[]).find((x) => x.type === "email"); const nameField = ((f.fields || []) as any[]).find((x) => x.name === "name");
  const email = emailField ? s(fd, "f_" + emailField.name, 120).toLowerCase() : null; const name = nameField ? s(fd, "f_" + nameField.name, 100) : null;
  if (s(fd, "consent") !== "on") redirect(bad);
  const u = await currentUser();
  const { error } = await db().from("form_submissions").insert({ form_key: key, data, email, name, user_id: u?.id || null });
  if (error) redirect(bad);
  await notify("form", `${f.title}: new submission`, [name, email].filter(Boolean).join(" · "), "/admin/submissions", "forms.read");
  const to = f.notify_email || (await getSettings()).contact_email;
  if (to) await sendMail(to, `New submission: ${f.title}`, wrapMail(f.title, Object.entries(data).map(([k, v]) => `<p><b>${esc(k)}</b><br>${esc(v)}</p>`).join("")));
  redirect(withQ(ret, "sent=ok") + "#form");
}

export async function registerWebinar(fd: FormData) {
  const slug = s(fd, "slug"); const back = `/webinars/${slug}`;
  if (s(fd, "website") || !(await allow("webinar-reg", 6, 900))) redirect(withQ(back, "r=err") + "#register");
  const { data: w } = await db().from("webinars").select("id,title,capacity,on_site_registration,status,join_url").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!w || !w.on_site_registration || w.status !== "scheduled") redirect(withQ(back, "r=closed") + "#register");
  const name = s(fd, "name", 100), email = s(fd, "email", 120).toLowerCase();
  if (!name || !okEmail(email) || fd.get("consent") !== "on") redirect(withQ(back, "r=err") + "#register");
  if (w.capacity) { const { count } = await db().from("webinar_registrations").select("id", { count: "exact", head: true }).eq("webinar_id", w.id).neq("status", "cancelled"); if ((count || 0) >= w.capacity) redirect(withQ(back, "r=full") + "#register"); }
  const { error } = await db().from("webinar_registrations").insert({ webinar_id: w.id, name, email, organisation: s(fd, "organisation", 120) || null, country: s(fd, "country", 80) || null });
  if (error) redirect(withQ(back, "r=dup") + "#register");
  await notify("webinar_registration", `Webinar registration: ${w.title}`, `${name} (${email})`, "/admin/webinar-registrations", "webinars.write");
  await sendMail(email, `You are registered: ${w.title}`, wrapMail("Registration received", `<p>Hello ${esc(name)}, we have your registration for <b>${esc(w.title)}</b>.</p>${w.join_url ? `<p>Join link: ${esc(w.join_url)}</p>` : ""}`));
  redirect(withQ(back, "r=ok") + "#register");
}

export async function submitChallenge(fd: FormData) {
  const bad = "/challenge/submit?sent=err";
  if (s(fd, "website") || !(await allow("challenge", 4, 1800))) redirect(bad);
  const o = { title: s(fd, "title", 150), group_name: s(fd, "group_name", 150), location: s(fd, "location", 120), contact_name: s(fd, "contact_name", 100), contact_email: s(fd, "contact_email", 120).toLowerCase(), summary: s(fd, "summary", 1200), challenge_identified: s(fd, "challenge_identified", 2500), solution: s(fd, "solution", 2500), impact: s(fd, "impact", 2500), link_url: s(fd, "link_url", 300) };
  if (!o.title || !o.group_name || !o.contact_name || !okEmail(o.contact_email) || !o.summary || fd.get("consent") !== "on") redirect(bad);
  const image = await uploadImage(fd.get("image"), "challenge"); const u = await currentUser();
  const { error } = await db().from("challenge_submissions").insert({ ...o, area_id: s(fd, "area_id") || null, image_url: image, user_id: u?.id || null, slug: slugify(o.title) + "-" + Math.random().toString(36).slice(2, 6) });
  if (error) redirect(bad);
  await notify("challenge", `Challenge project: ${o.title}`, `${o.group_name} (${o.contact_email})`, "/admin/challenge-submissions", "challenge.write");
  redirect("/challenge/submit?sent=ok");
}

export async function applyFacilitator(fd: FormData) {
  const bad = "/programmes/train-the-cooperation-facilitators?sent=err#apply";
  if (s(fd, "website") || !(await allow("facilitator", 3, 1800))) redirect(bad);
  const name = s(fd, "name", 100), email = s(fd, "email", 120).toLowerCase();
  if (!name || !okEmail(email) || fd.get("consent") !== "on") redirect(bad);
  const u = await currentUser();
  const { error } = await db().from("facilitators").insert({ name, email, phone: s(fd, "phone", 25) || null, organisation: s(fd, "organisation", 120) || null, location: s(fd, "location", 120) || null, experience: s(fd, "experience", 2000) || null, motivation: s(fd, "motivation", 2000) || null, programme_id: s(fd, "programme_id") || null, user_id: u?.id || null });
  if (error) redirect(bad);
  await notify("facilitator", `Facilitator application: ${name}`, email, "/admin/facilitators", "facilitators.write");
  redirect("/programmes/train-the-cooperation-facilitators?sent=ok#apply");
}

export async function login(fd: FormData) {
  const next = safe(s(fd, "next"), "/account"); if (!(await allow("login", 10, 600))) redirect("/login?e=rate");
  const { error } = await (await authClient()).auth.signInWithPassword({ email: s(fd, "email", 120), password: String(fd.get("password") || "") });
  if (error) redirect(`/login?e=bad&next=${encodeURIComponent(next)}`); redirect(next);
}
export async function register(fd: FormData) {
  if (!(await allow("register", 5, 900))) redirect("/register?e=rate");
  const email = s(fd, "email", 120), password = String(fd.get("password") || ""), name = s(fd, "name", 100);
  if (password.length < 8 || !okEmail(email)) redirect("/register?e=form");
  const { data, error } = await (await authClient()).auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${SITE_URL}/auth/callback?next=/account` } });
  if (error) redirect("/register?e=form");
  if (data?.user) { try { await db().from("profiles").upsert({ id: data.user.id, email, full_name: name }, { onConflict: "id" }); } catch { /* optional */ } }
  redirect(data?.session ? "/account" : "/login?r=1");
}
export async function forgot(fd: FormData) { if (await allow("forgot", 5, 900)) await (await authClient()).auth.resetPasswordForEmail(s(fd, "email", 120), { redirectTo: `${SITE_URL}/auth/callback?next=/reset-password` }); redirect("/forgot-password?sent=1"); }
export async function resetPassword(fd: FormData) {
  const pw = String(fd.get("password") || ""); if (pw.length < 8) redirect("/reset-password?e=short");
  const { error } = await (await authClient()).auth.updateUser({ password: pw }); if (error) redirect("/reset-password?e=bad"); redirect("/login?u=1");
}
export async function logout() { await (await authClient()).auth.signOut(); redirect("/"); }
export async function saveProfile(fd: FormData) {
  const u = await currentUser(); if (!u) redirect("/login");
  await db().from("profiles").upsert({ id: u.id, email: u.email, full_name: s(fd, "full_name", 100), phone: s(fd, "phone", 25), newsletter_pref: fd.get("newsletter_pref") === "on" }, { onConflict: "id" });
  redirect("/account?ok=1");
}
