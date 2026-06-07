// Canonical list of editable site content blocks.
// Single source of truth shared by the admin API (auto-provisioning) and the
// seed script. Adding a block here makes it appear in the admin Site Content
// control page automatically — no manual seeding required.

export interface SiteContentDefault {
  key: string;
  type: 'text' | 'image' | 'richtext' | 'array';
  value: any;
  section: string;
  description: string;
}

export const SITE_CONTENT_DEFAULTS: SiteContentDefault[] = [
  // ============ HEADER ============
  {
    key: 'header_announcement_left',
    type: 'text',
    value: 'Lagos · Abuja · London',
    section: 'header',
    description: 'Left slot of the desktop announcement bar',
  },
  {
    key: 'header_announcement_center',
    type: 'text',
    value: 'You belong in rooms where taste is understood',
    section: 'header',
    description: 'Centre slot of the desktop announcement bar',
  },
  {
    key: 'header_announcement_right',
    type: 'text',
    value: 'New arrivals — Season III',
    section: 'header',
    description: 'Right slot of the desktop announcement bar',
  },

  // ============ HOME PAGE ============
  {
    key: 'home_hero_image',
    type: 'image',
    value: '',
    section: 'home',
    description: 'Hero background image (top of the home page)',
  },
  {
    key: 'home_hero_headline',
    type: 'text',
    value: 'For nights that matter.',
    section: 'home',
    description: 'Hero section main headline',
  },
  {
    key: 'home_hero_subtext',
    type: 'text',
    value: 'Silhouette over decoration. Form over noise.',
    section: 'home',
    description: 'Hero section subtext below headline',
  },
  {
    key: 'home_editorial_image',
    type: 'image',
    value: '',
    section: 'home',
    description: 'Editorial split image ("Minutes Before Midnight")',
  },
  {
    key: 'home_custom_order_bg',
    type: 'image',
    value: '',
    section: 'home',
    description: 'Custom order / bespoke banner background image',
  },
  {
    key: 'home_bespoke_label',
    type: 'text',
    value: 'Bespoke',
    section: 'home',
    description: 'Eyebrow label on the custom order banner',
  },
  {
    key: 'home_bespoke_heading',
    type: 'text',
    value: 'Made for your exact silhouette.',
    section: 'home',
    description: 'Heading on the custom order banner',
  },
  {
    key: 'home_bespoke_cta',
    type: 'text',
    value: 'Start your custom order',
    section: 'home',
    description: 'CTA button text on the custom order banner',
  },

  // ============ ABOUT PAGE ============
  {
    key: 'about_hero_image',
    type: 'image',
    value: '',
    section: 'about',
    description: 'About page hero background image',
  },
  {
    key: 'about_story_title',
    type: 'text',
    value: 'We do not make clothing. We make the version of you the world sees.',
    section: 'about',
    description: 'Main story section title',
  },
  {
    key: 'about_workspace_image',
    type: 'image',
    value: '',
    section: 'about',
    description: 'About story / workspace image (two-column section)',
  },
  {
    key: 'about_headline',
    type: 'text',
    value: 'Born at the intersection of African identity and future thinking.',
    section: 'about',
    description: 'About page origin headline',
  },
  {
    key: 'about_story_text',
    type: 'richtext',
    value: 'ZIBARASTUDIO was built for the woman who moves through spaces where taste is the currency. Afro-futurism, not through the lens of tradition, but through silhouette, intention, and the architecture of the woman wearing it. Shape over pattern. Form over graphics. The African story pushed ahead of time.',
    section: 'about',
    description: 'Main story section text',
  },
  {
    key: 'about_editorial_image',
    type: 'image',
    value: '',
    section: 'about',
    description: 'Full-width editorial image near the bottom of the about page',
  },

  // ============ CONTACT PAGE ============
  {
    key: 'contact_email',
    type: 'text',
    value: 'studio@zibara.store',
    section: 'contact',
    description: 'Contact email address',
  },
  {
    key: 'contact_instagram',
    type: 'text',
    value: 'https://instagram.com/zibarastudio',
    section: 'contact',
    description: 'Instagram URL',
  },
  {
    key: 'contact_tiktok',
    type: 'text',
    value: 'https://tiktok.com/@zibarastudio',
    section: 'contact',
    description: 'TikTok URL',
  },

  // FAQ
  {
    key: 'contact_faq_1_question',
    type: 'text',
    value: 'How long does a custom piece take?',
    section: 'contact',
    description: 'FAQ 1 question',
  },
  {
    key: 'contact_faq_1_answer',
    type: 'richtext',
    value: 'Custom pieces typically take 10–18 business days. We discuss your exact timeline after the initial consultation.',
    section: 'contact',
    description: 'FAQ 1 answer',
  },
  {
    key: 'contact_faq_2_question',
    type: 'text',
    value: 'Do you ship internationally?',
    section: 'contact',
    description: 'FAQ 2 question',
  },
  {
    key: 'contact_faq_2_answer',
    type: 'richtext',
    value: 'Yes. We ship to Lagos, Abuja, and internationally including London, Paris, and New York. Shipping costs calculated at checkout.',
    section: 'contact',
    description: 'FAQ 2 answer',
  },
  {
    key: 'contact_faq_3_question',
    type: 'text',
    value: 'Can I visit the studio?',
    section: 'contact',
    description: 'FAQ 3 question',
  },
  {
    key: 'contact_faq_3_answer',
    type: 'richtext',
    value: 'Studio visits are by appointment. Contact us to schedule.',
    section: 'contact',
    description: 'FAQ 3 answer',
  },
  {
    key: 'contact_faq_4_question',
    type: 'text',
    value: 'What payment methods do you accept?',
    section: 'contact',
    description: 'FAQ 4 question',
  },
  {
    key: 'contact_faq_4_answer',
    type: 'richtext',
    value: 'We accept card payments, bank transfer, Paystack, and Flutterwave.',
    section: 'contact',
    description: 'FAQ 4 answer',
  },

  // ============ CUSTOM ORDER PAGE ============
  {
    key: 'custom_order_title',
    type: 'text',
    value: 'Bespoke',
    section: 'custom-order',
    description: 'Main title on custom order page',
  },
  {
    key: 'custom_order_subtitle',
    type: 'text',
    value: 'Made to the architecture of your silhouette.',
    section: 'custom-order',
    description: 'Subtitle below main title on custom order page',
  },
  {
    key: 'custom_order_intro_text',
    type: 'richtext',
    value: 'Share the piece you have in mind. Our atelier will review your vision, schedule a consultation, and return a timeline and quote within 48 hours. A 50% deposit initiates production.',
    section: 'custom-order',
    description: 'Introduction text explaining the custom order process',
  },
  {
    key: 'custom_order_success_title',
    type: 'text',
    value: 'Request Received',
    section: 'custom-order',
    description: 'Success message title after form submission',
  },
  {
    key: 'custom_order_success_text',
    type: 'richtext',
    value: 'Thank you. The atelier will contact you within 48 hours to discuss your vision and confirm the timeline.',
    section: 'custom-order',
    description: 'Success message text after form submission',
  },
  {
    key: 'custom_order_footer_text',
    type: 'richtext',
    value: 'A 50% deposit is required to begin production. The remaining balance is due before dispatch.',
    section: 'custom-order',
    description: 'Footer disclaimer text at bottom of custom order form',
  },
];

/**
 * Ensures every canonical content block exists in the database.
 * Inserts any missing keys (non-destructively — existing values are preserved),
 * so newly added blocks such as the hero / custom-order images show up in the
 * admin control page automatically without re-running the seed script.
 */
export async function ensureSiteContentDefaults(model: {
  bulkWrite: (ops: any[], options?: any) => Promise<any>;
}): Promise<void> {
  const ops = SITE_CONTENT_DEFAULTS.map((item) => ({
    updateOne: {
      filter: { key: item.key },
      update: { $setOnInsert: item },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await model.bulkWrite(ops, { ordered: false });
  }
}
