import { createClient } from "@supabase/supabase-js";
import { requireEnv, supabaseService, supabaseUrl } from "./env";
// Server only (service-role key). Every table is prefixed hc_ so this app can share a Supabase project.
export type Row = Record<string, any>;
let client: any;
export function db(): any {
  if (client) return client;
  requireEnv();
  const base = createClient(supabaseUrl(), supabaseService(), { auth: { persistSession: false, autoRefreshToken: false } });
  client = new Proxy(base, {
    get(target: any, prop: string) {
      if (prop === "from") return (t: string) => target.from(t.startsWith("hc_") ? t : "hc_" + t);
      if (prop === "rpc") return (fn: string, args?: any) => target.rpc(fn.startsWith("hc_") ? fn : "hc_" + fn, args);
      const v = target[prop];
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  return client;
}
export const BUCKET = "hc-media";
