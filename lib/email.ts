import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type OrderReceiptItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type OrderReceipt = {
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

let cachedTransporter: Transporter | null = null;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
};

const formatCurrency = (amount: number) => {
  return `$${amount.toLocaleString('en-US')}`;
};

export const sendOrderReceipt = async (order: OrderReceipt) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM;

  if (!transporter || !from) {
    return { skipped: true };
  }

  const itemLines = order.items
    .map((item) => {
      const details = [
        item.size ? `Size: ${item.size}` : null,
        item.color ? `Color: ${item.color}` : null,
      ].filter(Boolean).join(' · ');
      return `${item.name} × ${item.quantity}${details ? ` (${details})` : ''}`;
    })
    .join('\n');

  const subject = `Your ZIBARASTUDIO receipt - ${order.orderNumber}`;
  const text = [
    `Hi ${order.customer.firstName},`,
    '',
    `Thanks for your order. Your order number is ${order.orderNumber}.`,
    '',
    'Items:',
    itemLines,
    '',
    `Total: ${formatCurrency(order.total)}`,
    order.paymentMethod ? `Payment Method: ${order.paymentMethod}` : '',
    '',
    'We will notify you when your order ships.',
    '',
    'ZIBARASTUDIO',
  ].filter(Boolean).join('\n');

  const htmlItems = order.items
    .map((item) => {
      const details = [
        item.size ? `Size: ${item.size}` : null,
        item.color ? `Color: ${item.color}` : null,
      ].filter(Boolean).join(' · ');
      return `<li>${item.name} × ${item.quantity}${details ? ` <span>(${details})</span>` : ''}</li>`;
    })
    .join('');

  const html = `
    <p>Hi ${order.customer.firstName},</p>
    <p>Thanks for your order. Your order number is <strong>${order.orderNumber}</strong>.</p>
    <p><strong>Items:</strong></p>
    <ul>${htmlItems}</ul>
    <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    ${order.paymentMethod ? `<p><strong>Payment Method:</strong> ${order.paymentMethod}</p>` : ''}
    <p>We will notify you when your order ships.</p>
    <p>ZIBARASTUDIO</p>
  `;

  await transporter.sendMail({
    from,
    to: order.customer.email,
    subject,
    text,
    html,
  });

  return { sent: true };
};
