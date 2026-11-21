import nodemailer from "nodemailer";
import { smtpConfigured, SITE_URL } from "./env";
import { esc } from "./format";
import { getSettings } from "./settings";

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!smtpConfigured() || !to) return false;
  try {
    const s = await getSettings(); const port = Number(process.env.SMTP_PORT || 587);
    const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.sendMail({ from: process.env.SMTP_FROM || `${s.brand_name || "The Humanity & Cooperation Initiative"} <${process.env.SMTP_USER}>`, to, subject, html });
    return true;
  } catch { return false; }
}
export const wrapMail = (title: string, body: string, footer = "") => `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#141414"><h2 style="border-bottom:3px solid #c9a24a;padding-bottom:8px">${esc(title)}</h2>${body}<p style="color:#777;font-size:12px;margin-top:28px">The Humanity & Cooperation Initiative ${footer}</p></div>`;
export async function mailVerify(email: string, token: string) {
  const link = `${SITE_URL}/newsletter/verify?t=${token}`;
  return sendMail(email, "Confirm your subscription to The Humanity & Cooperation Initiative", wrapMail("Confirm your subscription", `<p>Please confirm that you want to receive The Humanity & Cooperation Initiative newsletter.</p><p><a href="${link}">Confirm subscription</a></p><p>If you did not ask for this, ignore this email.</p>`));
}
export const unsubLink = (token: string) => `${SITE_URL}/newsletter/unsubscribe?t=${token}`;
