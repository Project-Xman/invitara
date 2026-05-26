/**
 * WhatsApp Business Cloud API (Meta).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 *
 * Requires:
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_ACCESS_TOKEN
 *   WHATSAPP_APP_SECRET (for webhook signature verification)
 *
 * If unconfigured, sendWhatsAppTemplate returns ok=false so callers can fall back.
 */

import { env } from "./env";
import { log } from "./logger";

const GRAPH_VERSION = "v20.0";

interface TemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: number;
  parameters: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: { link: string } }
    | { type: "video"; video: { link: string } }
    | { type: "document"; document: { link: string; filename: string } }
  >;
}

export interface WhatsAppTemplateInput {
  to: string; // E.164 format e.g. +919876543210
  templateName: string;
  languageCode?: string;
  components?: TemplateComponent[];
}

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppTemplate(input: WhatsAppTemplateInput): Promise<WhatsAppSendResult> {
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) {
    log.warn("WhatsApp not configured — message skipped", { to: input.to });
    return { ok: false, error: "WhatsApp not configured" };
  }
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: input.to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.languageCode ?? "en" },
      components: input.components ?? [],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      log.warn("whatsapp send failed", { status: res.status, error: data.error });
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    const messageId: string | undefined = data.messages?.[0]?.id;
    return { ok: true, messageId };
  } catch (err) {
    log.error("whatsapp send error", { err: String(err) });
    return { ok: false, error: String(err) };
  }
}

/**
 * Send a personalized wedding invite via WhatsApp template.
 * Template `wedding_invite` must be pre-approved in Meta Business Manager.
 * Variables: {{1}} = guest name, {{2}} = couple names, {{3}} = personal link
 */
export async function sendWeddingInvite(input: {
  to: string;
  guestName: string;
  coupleNames: string;
  personalLink: string;
  inviteImageUrl?: string;
}): Promise<WhatsAppSendResult> {
  const components: TemplateComponent[] = [
    {
      type: "body",
      parameters: [
        { type: "text", text: input.guestName },
        { type: "text", text: input.coupleNames },
        { type: "text", text: input.personalLink },
      ],
    },
  ];

  if (input.inviteImageUrl) {
    components.unshift({
      type: "header",
      parameters: [{ type: "image", image: { link: input.inviteImageUrl } }],
    });
  }

  return sendWhatsAppTemplate({
    to: input.to,
    templateName: "wedding_invite",
    languageCode: "en",
    components,
  });
}

/**
 * Verify Meta webhook subscription handshake.
 */
export function verifyWebhookSubscription(mode: string, token: string): boolean {
  return mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN && !!token;
}

/**
 * Verify webhook request signature (X-Hub-Signature-256).
 */
import crypto from "node:crypto";

export function verifyWebhookSignature(rawBody: string, signature: string | null | undefined): boolean {
  if (!env.WHATSAPP_APP_SECRET || !signature) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
