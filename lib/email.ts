import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

export type OrderReceiptItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

export type OrderReceipt = {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderReceiptItem[];
  total: number;
  paymentMethod?: string;
};

export type EmailTemplateData = {
  subject: string;
  intro: string;
  footer: string;
};

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateData = {
  subject: 'Your ZIBARASTUDIO order — {{orderNumber}}',
  intro:
    'Thank you for your order. We are preparing your pieces with care and will notify you once they ship.',
  footer:
    'Questions? Reply to this email or visit zibara.store/contact — we respond within 24 hours.',
};

let cachedTransporter: Transporter | null = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
};

const formatCurrency = (amount: number) =>
  `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const isE2ETestMode = () =>
  process.env.E2E_TEST_MODE === '1' && process.env.NODE_ENV !== 'production';

const interpolate = (template: string, vars: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');

export const buildOrderReceiptHtml = (
  order: OrderReceipt,
  tpl: EmailTemplateData = DEFAULT_EMAIL_TEMPLATE,
): { subject: string; html: string; text: string } => {
  const vars: Record<string, string> = {
    orderNumber: order.orderNumber,
    firstName: order.customer.firstName,
    lastName: order.customer.lastName,
    email: order.customer.email,
    total: formatCurrency(order.total),
    paymentMethod: order.paymentMethod ?? '',
  };

  const subject = interpolate(tpl.subject, vars);
  const intro = interpolate(tpl.intro, vars);
  const footer = interpolate(tpl.footer, vars);

  const itemRows = order.items
    .map((item) => {
      const meta = [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
        .filter(Boolean)
        .join(' &nbsp;·&nbsp; ');
      return `
        <tr>
          <td style="padding:20px 0;border-bottom:1px solid rgba(3,3,3,0.12);">
            <p style="margin:0 0 4px 0;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#030303;">${item.name}</p>
            ${meta ? `<p style="margin:0 0 4px 0;font-family:monospace;font-size:10px;color:#1a1a0f;">${meta}</p>` : ''}
            <p style="margin:0;font-family:monospace;font-size:10px;color:#1a1a0f;">Qty: ${item.quantity} &nbsp;·&nbsp; ${formatCurrency(item.price * item.quantity)}</p>
          </td>
        </tr>`;
    })
    .join('');

  const itemTextLines = order.items
    .map((item) => {
      const meta = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
        .filter(Boolean)
        .join(' · ');
      return `${item.name} × ${item.quantity}${meta ? ` (${meta})` : ''} — ${formatCurrency(item.price * item.quantity)}`;
    })
    .join('\n');

  const text = [
    `ZIBARASTUDIO`,
    ``,
    `Hi ${order.customer.firstName},`,
    ``,
    intro,
    ``,
    `ORDER: ${order.orderNumber}`,
    ``,
    itemTextLines,
    ``,
    `Total: ${formatCurrency(order.total)}`,
    order.paymentMethod ? `Payment: ${order.paymentMethod}` : '',
    ``,
    footer,
    ``,
    `ZIBARASTUDIO`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="dark"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f4ee;color:#030303;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f4ee;min-height:100vh;">
    <tr>
      <td style="padding:0;">

        <!-- TOP BAR — dark accent strip -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:40px 56px 36px;background:#030303;">
              <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:#EFEFC9;">ZIBARASTUDIO</p>
            </td>
          </tr>
        </table>

        <!-- MAIN CONTENT -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:64px 56px 0;">

              <!-- Heading -->
              <h1 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:42px;letter-spacing:0.28em;text-transform:uppercase;color:#030303;line-height:1.1;">Order<br/>Confirmed</h1>
              <p style="margin:0 0 48px 0;font-family:monospace;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(3,3,3,0.5);">Hi ${order.customer.firstName} — ${order.orderNumber}</p>

              <!-- Intro -->
              <p style="margin:0 0 56px 0;font-family:monospace;font-size:12px;line-height:1.85;color:#1a1a0f;max-width:560px;">${intro}</p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid rgba(3,3,3,0.15);padding-bottom:0;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Section label -->
              <p style="margin:32px 0 0;font-family:monospace;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:rgba(3,3,3,0.4);">Order Details</p>

              <!-- Items -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:0;">
                ${itemRows}
              </table>

              <!-- Total -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:1px solid rgba(3,3,3,0.15);">
                <tr>
                  <td style="padding:24px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(3,3,3,0.5);">Total Paid</td>
                        <td align="right" style="font-family:monospace;font-size:15px;color:#030303;">${formatCurrency(order.total)}</td>
                      </tr>
                      ${order.paymentMethod ? `<tr><td colspan="2" style="padding-top:6px;font-family:monospace;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(3,3,3,0.4);">Via ${order.paymentMethod}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- FOOTER — dark accent strip -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:80px;">
          <tr>
            <td style="padding:40px 56px 56px;background:#030303;">
              <p style="margin:0 0 32px 0;font-family:monospace;font-size:11px;line-height:1.8;color:#EFEFC9;max-width:480px;">${footer}</p>
              <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(239,239,201,0.45);">ZIBARASTUDIO &nbsp;·&nbsp; AFRO-FUTURIST LUXURY</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
};

export const loadEmailTemplate = async (): Promise<EmailTemplateData> => {
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const SiteContent = (await import('@/models/SiteContent')).default;
    await connectDB();
    const docs = await SiteContent.find({
      key: { $in: ['email_order_subject', 'email_order_intro', 'email_order_footer'] },
    }).lean();
    const tpl: EmailTemplateData = { ...DEFAULT_EMAIL_TEMPLATE };
    for (const doc of docs as Array<{ key: string; value: unknown }>) {
      if (doc.key === 'email_order_subject') tpl.subject = doc.value as string;
      if (doc.key === 'email_order_intro') tpl.intro = doc.value as string;
      if (doc.key === 'email_order_footer') tpl.footer = doc.value as string;
    }
    return tpl;
  } catch {
    return { ...DEFAULT_EMAIL_TEMPLATE };
  }
};

export const sendOrderReceipt = async (order: OrderReceipt, tpl?: EmailTemplateData) => {
  // Fetch live template from DB if not supplied by caller
  const resolvedTpl = tpl ?? (await loadEmailTemplate());
  const { subject, html, text } = buildOrderReceiptHtml(order, resolvedTpl);

  if (isE2ETestMode()) {
    const artifactDir = process.env.E2E_ARTIFACT_DIR ?? path.join(process.cwd(), '.test-artifacts');
    await mkdir(artifactDir, { recursive: true });
    await appendFile(
      path.join(artifactDir, 'emails.jsonl'),
      `${JSON.stringify({ to: order.customer.email, subject, text, orderNumber: order.orderNumber, total: order.total })}\n`,
      'utf8',
    );
    return { captured: true };
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM;

  if (!transporter || !from) return { skipped: true };

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await transporter.sendMail({ from, to: order.customer.email, subject, text, html });
      return { sent: true };
    } catch (err) {
      lastError = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastError;
};
