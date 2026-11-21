import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
export const dynamic = "force-dynamic";
/** Counts the download, then redirects to the file or link. Only http(s) and site-relative targets are followed. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(new URL("/toolkit", req.url));
  const { data: r } = await db().from("resources").select("id,file_url,external_url").eq("id", id).eq("is_published", true).maybeSingle();
  const target = r?.file_url || r?.external_url; if (!r || !target || !/^(https?:\/\/|\/[^/])/.test(target)) return NextResponse.redirect(new URL("/toolkit", req.url));
  if (await allow("download", 60, 600)) await db().rpc("download", { p_resource: r.id });
  return NextResponse.redirect(target.startsWith("/") ? new URL(target, req.url) : target);
}
