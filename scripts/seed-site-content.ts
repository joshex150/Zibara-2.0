import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  type: { type: String, enum: ['text', 'image', 'richtext', 'array'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  section: { type: String, required: true },
  description: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

const siteContentData = [
  // ============ HOME PAGE ============
  {
    key: 'home_hero_image',
    type: 'image',
    value: 'zibara://hero/season-iii',
    section: 'home',
    description: 'Hero banner image on the homepage',
  },
  {
    key: 'home_banner_image',
    type: 'image',
    value: 'zibara://banner/home',
    section: 'home',
    description: 'Full width banner image at bottom of homepage',
  },
  {
    key: 'home_customs_title',
    type: 'text',
    value: 'ZIBARA BESPOKE',
    section: 'home',
    description: 'Title for the customs section',
  },
  {
    key: 'home_customs_description',
    type: 'richtext',
    value: 'Made to the exact architecture of your body. Our atelier translates your silhouette into a single piece — constructed, fitted, and finished by hand in Lagos. For ceremonies, for boardrooms, for the nights that require more than ready-to-wear can offer.',
    section: 'home',
    description: 'Description text for the customs section',
  },
  {
    key: 'home_customs_image',
    type: 'image',
    value: 'zibara://customs/atelier',
    section: 'home',
    description: 'Main image for customs section',
  },

  // ============ ABOUT PAGE ============
  {
    key: 'about_hero_image',
    type: 'image',
    value: 'zibara://about/studio',
    section: 'about',
    description: 'Hero image at top of about page',
  },
  {
    key: 'about_story_title',
    type: 'text',
    value: 'We do not make clothing. We make the version of you the world sees.',
    section: 'about',
    description: 'Main story section title',
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
    key: 'about_studio_image',
    type: 'image',
    value: 'zibara://about/workspace',
    section: 'about',
    description: 'Studio/workspace image',
  },
  {
    key: 'about_banner_image',
    type: 'image',
    value: 'zibara://about/editorial',
    section: 'about',
    description: 'Full-width editorial banner on about page',
  },

  // ============ CONTACT PAGE ============
  {
    key: 'contact_email',
    type: 'text',
    value: 'studio@zibarastudio.com',
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

async function seedSiteContent() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if content already exists
    const existingCount = await SiteContent.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing site content items.`);
      const forceFlag = process.argv.includes('--force');
      if (!forceFlag) {
        console.log('Use --force flag to replace existing content. Exiting...');
        process.exit(0);
      }
      console.log('--force flag detected. Deleting existing content...');
      await SiteContent.deleteMany({});
    }

    console.log('Inserting site content...');
    const result = await SiteContent.insertMany(siteContentData);
    console.log(`Successfully inserted ${result.length} site content items!`);

    // Group by section
    const sections: Record<string, number> = {};
    result.forEach(item => {
      sections[item.section] = (sections[item.section] || 0) + 1;
    });
    
    console.log('\nContent by section:');
    Object.entries(sections).forEach(([section, count]) => {
      console.log(`  ${section}: ${count} items`);
    });

  } catch (error) {
    console.error('Error seeding site content:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedSiteContent();
