import { subscribeNewsletter } from "@/app/actions";
export default function NewsletterForm({ ret, dark = false, status }: { ret: string; dark?: boolean; status?: string }) {
  return (<form action={subscribeNewsletter} id="newsletter" className="w-full max-w-md"><input type="hidden" name="ret" value={ret} /><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
    <div className="flex gap-2"><input name="email" type="email" required placeholder="Your email" aria-label="Email" className={`input ${dark ? "!border-white/30 !bg-transparent !text-white placeholder:text-white/50" : ""}`} /><button className="btn btn-gold shrink-0">Subscribe</button></div>
    <label className={`mt-2 flex items-start gap-2 text-xs ${dark ? "text-white/60" : "text-muted"}`}><input type="checkbox" name="consent" required className="mt-0.5" /><span>I agree to receive The Humanity & Cooperation Initiative newsletter and understand I can unsubscribe at any time.</span></label>
    {status === "ok" && <p className="mt-2 text-sm text-gold">Thank you. Check your inbox to confirm (if required).</p>}{status === "err" && <p className="mt-2 text-sm text-red-500">Could not subscribe. Check the email and consent box.</p>}</form>);
}
