import "server-only";
import { putDbItem, queryDbByPk } from "./db";
import type { LeadInquiry } from "./types";

export type { LeadInquiry };

export const LEADS_TARGET_EMAIL = "leads@beetrix360.com";

/**
 * Builds HTML template for the lead inquiry notification email.
 */
function buildLeadEmailHtml(inquiry: LeadInquiry): string {
  const cleanPhone = inquiry.whatsapp?.replace(/[^0-9+]/g, "") || "";
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace("+", "")}` : null;
  const siteUrl = inquiry.website ? (inquiry.website.startsWith("http") ? inquiry.website : `https://${inquiry.website}`) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead Inquiry - Beetrix360</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .header { background: #0b0f19; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #ff2d8a; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .body { padding: 32px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .grid { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .grid td { padding: 10px 0; vertical-align: top; border-bottom: 1px solid #f8fafc; font-size: 14px; }
    .grid td.label { width: 140px; color: #64748b; font-weight: 600; font-size: 13px; }
    .grid td.value { color: #0f172a; font-weight: 500; }
    .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .attribution-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .attribution-title { font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; margin: 0 0 10px; letter-spacing: 0.5px; }
    .btn { display: inline-block; padding: 8px 16px; border-radius: 8px; background: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">New Lead Received</div>
      <h1>${inquiry.name || "Prospective Client"}</h1>
      <p>Submitted on ${new Date(inquiry.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" })} (EST)</p>
    </div>

    <div class="body">
      <div class="highlight-box">
        <strong style="color: #166534; font-size: 15px;">Primary Goal: ${inquiry.goal || "Website Growth & AI Integration"}</strong>
        ${inquiry.budget ? `<div style="font-size: 13px; color: #15803d; margin-top: 4px;">Budget: <strong>${inquiry.budget}</strong></div>` : ""}
      </div>

      <div class="section-title">Contact Information</div>
      <table class="grid">
        <tr>
          <td class="label">Full Name</td>
          <td class="value"><strong>${inquiry.name}</strong></td>
        </tr>
        <tr>
          <td class="label">Work Email</td>
          <td class="value"><a href="mailto:${inquiry.email}" style="color: #2563eb; text-decoration: none;">${inquiry.email}</a></td>
        </tr>
        <tr>
          <td class="label">WhatsApp Number</td>
          <td class="value">
            ${inquiry.whatsapp ? `
              <span style="font-family: monospace; font-size: 14px;">${inquiry.whatsapp}</span>
              ${waLink ? ` &nbsp; <a href="${waLink}" class="btn" style="vertical-align: middle;">Chat on WhatsApp</a>` : ""}
            ` : `<span style="color: #94a3b8;">Not provided</span>`}
          </td>
        </tr>
        <tr>
          <td class="label">Company Website</td>
          <td class="value">
            ${siteUrl ? `<a href="${siteUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${inquiry.website}</a>` : `<span style="color: #94a3b8;">Not provided</span>`}
          </td>
        </tr>
        ${inquiry.notes ? `
        <tr>
          <td class="label">Notes / Message</td>
          <td class="value" style="white-space: pre-line;">${inquiry.notes}</td>
        </tr>` : ""}
      </table>

      <!-- Dynamic Page & Origin Attribution -->
      <div class="attribution-box">
        <div class="attribution-title">Lead Origin &amp; Page Attribution</div>
        <table class="grid" style="margin-bottom: 0;">
          <tr>
            <td class="label" style="color: #1e40af;">Page URL</td>
            <td class="value"><a href="${inquiry.pageUrl || "https://www.beetrix360.com"}" target="_blank" style="color: #2563eb; word-break: break-all;">${inquiry.pageUrl || "Direct"}</a></td>
          </tr>
          <tr>
            <td class="label" style="color: #1e40af;">Section Name</td>
            <td class="value"><strong>${inquiry.sectionName || "General Site CTA"}</strong></td>
          </tr>
          <tr>
            <td class="label" style="color: #1e40af;">Button Trigger</td>
            <td class="value"><span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${inquiry.buttonName || "CTA"}</span></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="footer">
      Automated Lead Notification · BeeTrix360 Revenue Engine · <a href="https://www.beetrix360.com/admin/inquiries" style="color: #64748b;">View in Admin Studio</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends inquiry email to leads@beetrix360.com via SendGrid API
 * and persists the lead record in the internal database.
 */
export async function sendLeadInquiry(data: {
  name: string;
  email: string;
  whatsapp?: string;
  website?: string;
  goal?: string;
  budget?: string;
  notes?: string;
  pageUrl?: string;
  sectionName?: string;
  buttonName?: string;
}): Promise<{ success: boolean; id: string; emailSent: boolean; message?: string }> {
  const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const createdAt = new Date().toISOString();

  const record: LeadInquiry = {
    id,
    name: data.name?.trim() || "Website Visitor",
    email: data.email?.trim() || "",
    whatsapp: data.whatsapp?.trim() || undefined,
    website: data.website?.trim() || undefined,
    goal: data.goal?.trim() || undefined,
    budget: data.budget?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    pageUrl: data.pageUrl?.trim() || undefined,
    sectionName: data.sectionName?.trim() || undefined,
    buttonName: data.buttonName?.trim() || undefined,
    status: "new",
    createdAt,
  };

  let emailSent = false;
  let emailError = "";

  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || LEADS_TARGET_EMAIL;

  if (sendgridApiKey) {
    try {
      const subject = `[New Lead] ${record.name}${record.goal ? ` · ${record.goal}` : ""} (${record.sectionName || "Website"})`;
      const htmlContent = buildLeadEmailHtml(record);

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: LEADS_TARGET_EMAIL, name: "BeeTrix360 Leads" }],
              subject,
            },
          ],
          from: { email: fromEmail, name: "BeeTrix360 Website Leads" },
          reply_to: { email: record.email, name: record.name },
          content: [
            {
              type: "text/html",
              value: htmlContent,
            },
          ],
        }),
      });

      if (res.ok || res.status === 202) {
        emailSent = true;
      } else {
        const errorText = await res.text();
        emailError = `SendGrid responded with status ${res.status}: ${errorText}`;
        console.warn("[SendGrid Error]:", emailError);
      }
    } catch (err: any) {
      emailError = err.message || "Network error while calling SendGrid";
      console.warn("[SendGrid Dispatch Exception]:", emailError);
    }
  } else {
    // If SendGrid key not configured yet, log safely and store to DB
    console.info("[Lead Inquiry]: Stored locally. To dispatch live emails, set SENDGRID_API_KEY in environment.");
  }

  record.emailSent = emailSent;
  if (emailError) record.emailError = emailError;

  // Persist to DB store under "INQUIRY" partition key
  try {
    await putDbItem("INQUIRY", id, record);
  } catch (err) {
    console.error("[Lead Inquiry DB Save Error]:", err);
  }

  return {
    success: true,
    id,
    emailSent,
    message: emailSent
      ? "Inquiry sent to leads@beetrix360.com"
      : "Inquiry saved in database (SendGrid pending)",
  };
}

/**
 * Returns all lead inquiries for admin viewing.
 */
export async function getLeadInquiries(): Promise<LeadInquiry[]> {
  try {
    const list = await queryDbByPk<LeadInquiry>("INQUIRY");
    return (list || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

