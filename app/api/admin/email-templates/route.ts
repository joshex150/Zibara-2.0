import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { DEFAULT_EMAIL_TEMPLATE, type EmailTemplateData } from '@/lib/email';

const TEMPLATE_KEYS = ['email_order_subject', 'email_order_intro', 'email_order_footer'] as const;

const keyToField: Record<string, keyof EmailTemplateData> = {
  email_order_subject: 'subject',
  email_order_intro: 'intro',
  email_order_footer: 'footer',
};

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  await connectDB();
  const docs = await SiteContent.find({ key: { $in: TEMPLATE_KEYS } }).lean();

  const tpl: EmailTemplateData = { ...DEFAULT_EMAIL_TEMPLATE };
  for (const doc of docs) {
    const field = keyToField[doc.key as string];
    if (field) (tpl as Record<string, string>)[field] = doc.value as string;
  }

  return NextResponse.json({ success: true, data: tpl });
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = (await request.json()) as Partial<EmailTemplateData>;
  await connectDB();

  const updates: Promise<unknown>[] = [];

  if (typeof body.subject === 'string') {
    updates.push(
      SiteContent.findOneAndUpdate(
        { key: 'email_order_subject' },
        { key: 'email_order_subject', type: 'text', value: body.subject, section: 'email', description: 'Order receipt email subject line. Use {{orderNumber}} as a placeholder.' },
        { upsert: true, new: true },
      ),
    );
  }
  if (typeof body.intro === 'string') {
    updates.push(
      SiteContent.findOneAndUpdate(
        { key: 'email_order_intro' },
        { key: 'email_order_intro', type: 'text', value: body.intro, section: 'email', description: 'Intro paragraph shown after the order heading. Supports {{firstName}}, {{orderNumber}}.' },
        { upsert: true, new: true },
      ),
    );
  }
  if (typeof body.footer === 'string') {
    updates.push(
      SiteContent.findOneAndUpdate(
        { key: 'email_order_footer' },
        { key: 'email_order_footer', type: 'text', value: body.footer, section: 'email', description: 'Footer message before the ZIBARASTUDIO signature. Supports {{firstName}}.' },
        { upsert: true, new: true },
      ),
    );
  }

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
