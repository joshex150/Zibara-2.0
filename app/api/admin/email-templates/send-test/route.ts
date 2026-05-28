import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { sendOrderReceipt, DEFAULT_EMAIL_TEMPLATE, type EmailTemplateData } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const toEmail: string = body.email ?? (session.user?.email as string);
  if (!toEmail) {
    return NextResponse.json({ success: false, error: 'Recipient email required.' }, { status: 400 });
  }

  await connectDB();
  const docs = await SiteContent.find({ key: { $in: ['email_order_subject', 'email_order_intro', 'email_order_footer'] } }).lean();

  const tpl: EmailTemplateData = { ...DEFAULT_EMAIL_TEMPLATE };
  for (const doc of docs) {
    if (doc.key === 'email_order_subject') tpl.subject = doc.value as string;
    if (doc.key === 'email_order_intro') tpl.intro = doc.value as string;
    if (doc.key === 'email_order_footer') tpl.footer = doc.value as string;
  }

  // Use a preview template override if provided in body
  if (body.template) {
    Object.assign(tpl, body.template);
  }

  const result = await sendOrderReceipt(
    {
      orderNumber: 'CRL-PREVIEW-0000',
      customer: { firstName: 'Preview', lastName: 'Customer', email: toEmail },
      items: [
        { name: 'LUMA SHEATH DRESS', quantity: 1, price: 430, size: 'M', color: 'Onyx' },
        { name: 'ADIRE WRAP COAT', quantity: 1, price: 290, size: 'S' },
      ],
      total: 730,
      paymentMethod: 'Test Preview',
    },
    tpl,
  );

  return NextResponse.json({ success: true, result });
}
