import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

/**
 * Creates the in-app notification (always) and attempts an email to the directiva (best-effort).
 * SMTP is optional: without SMTP_HOST configured, the email is just logged to the console --
 * see .env.example for how to plug real credentials later.
 */
export async function notifyDirectiva(type: string, message: string) {
  await prisma.notification.create({ data: { type, message } });

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log(`[notify:email:skipped-no-smtp] ${message}`);
    return;
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? "Invictus Padel Club <no-reply@invictuspadel.local>",
      to: process.env.NOTIFY_EMAIL_TO ?? "directiva@invictuspadel.local",
      subject: "Invictus Padel Club — aviso para directiva",
      text: message,
    });
  } catch (err) {
    console.error("[notify:email:failed]", err);
  }
}
