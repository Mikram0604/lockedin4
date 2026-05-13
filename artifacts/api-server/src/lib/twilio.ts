import { logger } from "./logger";

export async function sendMessage(phone: string, message: string): Promise<{ sid: string; channel: "whatsapp" | "sms" } | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    logger.warn("Twilio credentials not configured — message not sent");
    return null;
  }

  const normalizedFrom = fromNumber.replace(/^whatsapp:/i, "").replace(/^sms:/i, "").trim();
  const normalizedPhone = phone.replace(/^whatsapp:/i, "").replace(/^sms:/i, "").trim();
  const phoneE164 = normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;

  // Try WhatsApp first
  try {
    const body = new URLSearchParams({
      From: `whatsapp:${normalizedFrom}`,
      To: `whatsapp:${phoneE164}`,
      Body: message,
    });
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (resp.ok) {
      const data = (await resp.json()) as { sid: string };
      logger.info({ sid: data.sid, channel: "whatsapp", phone: phoneE164 }, "Message sent via WhatsApp");
      return { sid: data.sid, channel: "whatsapp" };
    }
    const errText = await resp.text();
    const errJson = JSON.parse(errText) as { code?: number };
    // 63007 = WhatsApp channel not found, 21606 = From number not WhatsApp-enabled
    if (errJson.code !== 63007 && errJson.code !== 21606 && errJson.code !== 63016) {
      throw new Error(`Twilio WhatsApp error ${resp.status}: ${errText}`);
    }
    logger.info({ code: errJson.code }, "WhatsApp not available, falling back to SMS");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("Twilio WhatsApp error")) throw err;
    logger.info("WhatsApp send failed, falling back to SMS");
  }

  // SMS fallback
  const smsBody = new URLSearchParams({
    From: normalizedFrom,
    To: phoneE164,
    Body: message,
  });
  const smsResp = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: smsBody.toString(),
  });
  if (!smsResp.ok) {
    const text = await smsResp.text();
    throw new Error(`Twilio SMS error ${smsResp.status}: ${text}`);
  }
  const smsData = (await smsResp.json()) as { sid: string };
  logger.info({ sid: smsData.sid, channel: "sms", phone: phoneE164 }, "Message sent via SMS");
  return { sid: smsData.sid, channel: "sms" };
}

/** @deprecated Use sendMessage instead */
export const sendWhatsAppMessage = async (phone: string, message: string) => sendMessage(phone, message);

export function buildTwiML(message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
}
