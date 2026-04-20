import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
    console.log(`Loaded env from ${envPath}`);
    break;
  }
}

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true, default: [] },
  category: { type: String, required: true },
  sizes: { type: [String], default: [] },
  colors: {
    type: [{
      name: { type: String, required: true },
      hex: { type: String, required: true },
    }],
    default: [],
  },
  material: { type: String, default: '' },
  care: { type: [String], default: [] },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  season: { type: String, required: true },
  year: { type: Number, required: true },
  description: { type: String, required: true },
  writeUp: { type: String, required: true },
  coverImage: { type: String, required: true },
  images: { type: [String], default: [] },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  publishDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  type: { type: String, enum: ['text', 'image', 'richtext', 'array'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  section: { type: String, required: true },
  description: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const ProductMeasurementSchema = new mongoose.Schema({
  size: { type: String, required: true },
  bust: { type: Number, required: true },
  waist: { type: Number, required: true },
  hip: { type: Number, required: true },
  length: { type: Number, required: true },
  sleeve: { type: Number, required: true },
  cuff: { type: Number, required: true },
});

const BodyMeasurementSchema = new mongoose.Schema({
  size: { type: String, required: true },
  height: { type: String, required: true },
  bust: { type: String, required: true },
  waist: { type: String, required: true },
  hip: { type: String, required: true },
});

const SizeGuideSchema = new mongoose.Schema({
  productMeasurements: { type: [ProductMeasurementSchema], default: [] },
  bodyMeasurements: { type: [BodyMeasurementSchema], default: [] },
  fitType: { type: String, enum: ['skinny', 'regular', 'oversized'], default: 'regular' },
  stretch: { type: String, enum: ['none', 'slight', 'medium', 'high'], default: 'slight' },
  measurementTips: { type: [String], default: [] },
  sizeTips: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const PopupSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  title: { type: String, default: 'PRIVATE ACCESS' },
  message: { type: String, default: 'Welcome to ZIBARASTUDIO.' },
  showButton: { type: Boolean, default: true },
  buttonText: { type: String, default: 'Enter Store' },
  buttonLink: { type: String, default: '/shop' },
  showOnce: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
const SizeGuide = mongoose.models.SizeGuide || mongoose.model('SizeGuide', SizeGuideSchema);
const Popup = mongoose.models.Popup || mongoose.model('Popup', PopupSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

type ProductSeed = {
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  material: string;
  care: string[];
  inStock: boolean;
  featured: boolean;
};

type CollectionSeed = {
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  writeUp: string;
  coverImage: string;
  images: string[];
  productNames: string[];
  featured: boolean;
  published: boolean;
  publishDate: Date;
};

const CARE_STANDARD = [
  'Dry clean only',
  'Store on a padded hanger',
  'Protect from direct sunlight',
];

const products: ProductSeed[] = [
  {
    name: 'LUMA SHEATH DRESS',
    price: 540,
    description: 'A disciplined sheath in structured crepe, cut to follow the spine and hold the room without raising its voice.',
    images: ['zibara://products/luma-sheath/01', 'zibara://products/luma-sheath/02'],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Ivory Cream', hex: '#EFEFC9' },
      { name: 'Obsidian', hex: '#030303' },
    ],
    material: 'Structured crepe with silk-touch lining, finished by hand in Lagos.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'IBEJI CORSET',
    price: 430,
    description: 'Architectural corsetry in compressed matte satin with internal boning and waxed-cord lacing.',
    images: ['zibara://products/ibeji-corset/01', 'zibara://products/ibeji-corset/02'],
    category: 'Corsetry',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Bloodwine', hex: '#640017' },
      { name: 'Espresso', hex: '#2F1B1A' },
    ],
    material: 'Compressed satin with internal boning and silk-bound finishing.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'ZIBARA COAT - OBSIDIAN',
    price: 960,
    description: 'A floor-length wool overcoat with dropped shoulder and controlled volume, engineered like architecture.',
    images: ['zibara://products/zibara-coat/01', 'zibara://products/zibara-coat/02'],
    category: 'Outerwear',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#030303' },
      { name: 'Olive Smoke', hex: '#5A5E27' },
    ],
    material: 'Virgin wool with viscose lining and hand-finished internal seams.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'OSHUN SLIP',
    price: 360,
    description: 'A bias-cut silk slip with a weighted drape and exposed shoulders, meant for rooms that do not end early.',
    images: ['zibara://products/oshun-slip/01', 'zibara://products/oshun-slip/02'],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Inferno', hex: '#4E0000' },
      { name: 'Obsidian', hex: '#030303' },
    ],
    material: 'Silk charmeuse with a fluid bias-cut construction.',
    care: CARE_STANDARD,
    inStock: true,
    featured: false,
  },
  {
    name: 'YORUBA TROUSER',
    price: 390,
    description: 'A high-rise trouser with a fluid leg and clean finish, tailored to move with restraint and intention.',
    images: ['zibara://products/yoruba-trouser/01', 'zibara://products/yoruba-trouser/02'],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Espresso', hex: '#2F1B1A' },
      { name: 'Obsidian', hex: '#030303' },
    ],
    material: 'Tencel-wool suiting with a soft structured hand.',
    care: CARE_STANDARD,
    inStock: true,
    featured: false,
  },
  {
    name: 'ASHE BLAZER',
    price: 680,
    description: 'A double-breasted blazer with extended shoulder, quiet authority, and sharp internal construction.',
    images: ['zibara://products/ashe-blazer/01', 'zibara://products/ashe-blazer/02'],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#030303' },
      { name: 'Gold Dust', hex: '#C9A96E' },
    ],
    material: 'Worsted wool with hand-finished lapels and cupro lining.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'NOKTURNE GOWN',
    price: 890,
    description: 'A ceremony gown in compressed crimson silk with a plunge front, bare back, and sculpted torso.',
    images: ['zibara://products/nokturne-gown/01', 'zibara://products/nokturne-gown/02'],
    category: 'Evening',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Inferno', hex: '#4E0000' },
      { name: 'Bloodwine', hex: '#640017' },
    ],
    material: 'Compressed silk faille with internal torso shaping.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'EBUN MIDI',
    price: 410,
    description: 'A column midi with a mandarin collar and covered placket that stays severe at rest and elegant in motion.',
    images: ['zibara://products/ebun-midi/01', 'zibara://products/ebun-midi/02'],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Olive Smoke', hex: '#5A5E27' },
      { name: 'Ivory Cream', hex: '#EFEFC9' },
    ],
    material: 'Double-face crepe with a clean internal finish.',
    care: CARE_STANDARD,
    inStock: true,
    featured: false,
  },
  {
    name: 'IFE BUSTIER',
    price: 340,
    description: 'A polished leather bustier with structured cups and back boning, built to carry attention without effort.',
    images: ['zibara://products/ife-bustier/01', 'zibara://products/ife-bustier/02'],
    category: 'Corsetry',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#030303' },
      { name: 'Espresso', hex: '#2F1B1A' },
    ],
    material: 'Polished lamb leather with a fully lined interior.',
    care: ['Leather specialist cleaning only', 'Store upright', 'Protect from moisture'],
    inStock: true,
    featured: false,
  },
  {
    name: 'DAMA SKIRT',
    price: 330,
    description: 'A column skirt with a back vent and measured stride, designed to hold its line in stillness.',
    images: ['zibara://products/dama-skirt/01', 'zibara://products/dama-skirt/02'],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Espresso', hex: '#2F1B1A' },
      { name: 'Bloodwine', hex: '#640017' },
    ],
    material: 'Heavy crepe suiting with a satin-bound interior.',
    care: CARE_STANDARD,
    inStock: true,
    featured: false,
  },
  {
    name: 'AYABA CAPE',
    price: 710,
    description: 'A floor cape with concealed arm slits and a sculpted collar, translating royalty into modern restraint.',
    images: ['zibara://products/ayaba-cape/01', 'zibara://products/ayaba-cape/02'],
    category: 'Outerwear',
    sizes: ['ONE SIZE'],
    colors: [
      { name: 'Obsidian', hex: '#030303' },
      { name: 'Gold Dust', hex: '#C9A96E' },
    ],
    material: 'Wool-cashmere blend with a brushed interior finish.',
    care: CARE_STANDARD,
    inStock: true,
    featured: false,
  },
  {
    name: 'OBSIDIA GLOVE',
    price: 180,
    description: 'An opera-length leather glove with silk-lined cuff and a narrow silhouette for finishing after-dark looks.',
    images: ['zibara://products/obsidia-glove/01', 'zibara://products/obsidia-glove/02'],
    category: 'Accessories',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#030303' },
      { name: 'Bloodwine', hex: '#640017' },
    ],
    material: 'Lamb leather with silk lining.',
    care: ['Leather specialist cleaning only', 'Store flat', 'Protect from moisture'],
    inStock: true,
    featured: false,
  },
  {
    name: 'KASA DRAPED GOWN',
    price: 940,
    description: 'A shoulder-baring evening gown with a liquid drape, cut to move slowly and arrive with certainty.',
    images: ['zibara://products/kasa-draped-gown/01', 'zibara://products/kasa-draped-gown/02'],
    category: 'Evening',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Bloodwine', hex: '#640017' },
      { name: 'Ivory Cream', hex: '#EFEFC9' },
    ],
    material: 'Weighted satin jersey with soft internal support.',
    care: CARE_STANDARD,
    inStock: true,
    featured: true,
  },
  {
    name: 'ORUN CLUTCH',
    price: 260,
    description: 'A hard-shell evening clutch with metallic lining and a compact architectural profile.',
    images: ['zibara://products/orun-clutch/01', 'zibara://products/orun-clutch/02'],
    category: 'Accessories',
    sizes: ['ONE SIZE'],
    colors: [
      { name: 'Gold Dust', hex: '#C9A96E' },
      { name: 'Obsidian', hex: '#030303' },
    ],
    material: 'Structured leather shell with brushed metallic lining.',
    care: ['Wipe clean with a soft cloth', 'Store in dust bag', 'Avoid prolonged moisture'],
    inStock: true,
    featured: false,
  },
];

const categories = [
  {
    name: 'Dresses',
    slug: 'dresses',
    description: 'Sculpted dresses built for ceremony, presence, and late rooms.',
    image: 'zibara://categories/dresses',
    order: 0,
  },
  {
    name: 'Corsetry',
    slug: 'corsetry',
    description: 'Structured foundations, precise lines, and deliberate tension.',
    image: 'zibara://categories/corsetry',
    order: 1,
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Protective silhouettes designed to enter the room first.',
    image: 'zibara://categories/outerwear',
    order: 2,
  },
  {
    name: 'Tailoring',
    slug: 'tailoring',
    description: 'Architectural separates with a calm, exacting point of view.',
    image: 'zibara://categories/tailoring',
    order: 3,
  },
  {
    name: 'Evening',
    slug: 'evening',
    description: 'After-dark pieces for private dinners, galas, and nights that matter.',
    image: 'zibara://categories/evening',
    order: 4,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Finishing gestures in leather, metal, and shadowed tones.',
    image: 'zibara://categories/accessories',
    order: 5,
  },
];

const collections: CollectionSeed[] = [
  {
    name: 'Minutes Before Midnight',
    slug: 'minutes-before-midnight',
    season: 'Season III',
    year: 2026,
    description: 'Ceremonial silhouettes for private dinners, gallery nights, and the hour just before arrival.',
    writeUp: 'Minutes Before Midnight is built for the exact moment composure becomes magnetic. The silhouettes are long, dark, and deliberate, carrying the calm severity of Afro-futurist eveningwear into a modern Lagos night. Crimson appears only where it matters. Cream is used like light. Every piece is meant to feel like a decision, not an ornament.',
    coverImage: 'zibara://collections/minutes-before-midnight/cover',
    images: [
      'zibara://collections/minutes-before-midnight/01',
      'zibara://collections/minutes-before-midnight/02',
      'zibara://collections/minutes-before-midnight/03',
    ],
    productNames: ['NOKTURNE GOWN', 'KASA DRAPED GOWN', 'OSHUN SLIP', 'LUMA SHEATH DRESS', 'OBSIDIA GLOVE'],
    featured: true,
    published: true,
    publishDate: new Date('2026-03-15T00:00:00.000Z'),
  },
  {
    name: 'Quiet Power',
    slug: 'quiet-power',
    season: 'Atelier I',
    year: 2026,
    description: 'Tailoring and outerwear for women who do not need volume to be noticed.',
    writeUp: 'Quiet Power focuses on silhouette as authority. The line of the shoulder, the weight of the hem, and the refusal of excess become the language. These are clothes for boardrooms, private salons, and formal rooms where certainty is the dress code. Nothing is loud. Everything is exact.',
    coverImage: 'zibara://collections/quiet-power/cover',
    images: [
      'zibara://collections/quiet-power/01',
      'zibara://collections/quiet-power/02',
      'zibara://collections/quiet-power/03',
    ],
    productNames: ['ASHE BLAZER', 'YORUBA TROUSER', 'DAMA SKIRT', 'IBEJI CORSET', 'AYABA CAPE', 'ZIBARA COAT - OBSIDIAN'],
    featured: true,
    published: true,
    publishDate: new Date('2026-02-20T00:00:00.000Z'),
  },
  {
    name: 'Obsidian Rooms',
    slug: 'obsidian-rooms',
    season: 'Salon Edit',
    year: 2026,
    description: 'A compact edit of leather, structure, and controlled shine for intimate spaces.',
    writeUp: 'Obsidian Rooms is an edit for intimate entrances: small dinners, private previews, collector evenings, and rooms with low light and high standards. The materials are tactile, the silhouettes direct, and the palette stays close to shadow. It is less about making noise and more about shaping memory.',
    coverImage: 'zibara://collections/obsidian-rooms/cover',
    images: [
      'zibara://collections/obsidian-rooms/01',
      'zibara://collections/obsidian-rooms/02',
    ],
    productNames: ['IFE BUSTIER', 'EBUN MIDI', 'ORUN CLUTCH', 'OBSIDIA GLOVE'],
    featured: false,
    published: true,
    publishDate: new Date('2026-01-12T00:00:00.000Z'),
  },
];

const siteContent = [
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
    value: 'Made to the exact architecture of your body. Our atelier translates your silhouette into a single piece - constructed, fitted, and finished by hand in Lagos. For ceremonies, for boardrooms, for the nights that require more than ready-to-wear can offer.',
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
    value: 'Custom pieces typically take 10-18 business days. We discuss your exact timeline after the initial consultation.',
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
    value: 'Yes. We ship to Lagos, Abuja, and internationally including London, Paris, and New York. Shipping costs are calculated at checkout.',
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
    value: 'Studio visits are by appointment. Contact us to schedule a private fitting or consultation.',
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

const sizeGuide = {
  productMeasurements: [
    { size: 'XS', bust: 82, waist: 66, hip: 88, length: 55, sleeve: 58, cuff: 18 },
    { size: 'S', bust: 86, waist: 70, hip: 92, length: 56, sleeve: 59, cuff: 19 },
    { size: 'M', bust: 92, waist: 76, hip: 98, length: 58, sleeve: 60, cuff: 20 },
    { size: 'L', bust: 98, waist: 82, hip: 104, length: 60, sleeve: 61, cuff: 21 },
    { size: 'XL', bust: 106, waist: 90, hip: 112, length: 62, sleeve: 62, cuff: 22 },
    { size: 'XXL', bust: 114, waist: 98, hip: 120, length: 64, sleeve: 63, cuff: 23 },
  ],
  bodyMeasurements: [
    { size: 'XS', height: '160-165', bust: '82-86', waist: '62-66', hip: '87-91' },
    { size: 'S', height: '165-170', bust: '86-90', waist: '66-70', hip: '91-95' },
    { size: 'M', height: '165-170', bust: '90-94', waist: '70-74', hip: '95-99' },
    { size: 'L', height: '170-175', bust: '94-100', waist: '74-80', hip: '99-105' },
    { size: 'XL', height: '170-175', bust: '100-106', waist: '80-86', hip: '105-111' },
    { size: 'XXL', height: '175-180', bust: '106-112', waist: '86-92', hip: '111-117' },
  ],
  fitType: 'regular',
  stretch: 'slight',
  measurementTips: [
    'Measure around the fullest part of your bust while keeping the tape parallel to the floor.',
    'Measure your natural waist at the narrowest point of your torso.',
    'Measure around the fullest part of your hips with your feet together.',
    'For long pieces, measure from the highest point of your shoulder to your desired hem.',
    'Measure sleeve length from shoulder seam to wrist with the arm slightly bent.',
  ],
  sizeTips: [
    'If you are between sizes, choose the larger option for a cleaner ZIBARA tailored fit.',
    'Structured pieces are cut to hold shape, so take fresh measurements before ordering.',
    'Hand-finished garments may vary slightly within 1-2 cm of the listed measurements.',
    'Contact the atelier if you need sizing advice for formalwear or custom orders.',
  ],
};

const popup = {
  enabled: false,
  title: 'PRIVATE ACCESS',
  message: 'Welcome to ZIBARASTUDIO.\n\nUse this popup for trunk-show notices, private appointments, or seasonal announcements.',
  showButton: true,
  buttonText: 'Explore the Collection',
  buttonLink: '/shop',
  showOnce: true,
};

async function seedProducts() {
  await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: {
          $set: {
            ...product,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
  );

  const seededProducts = await Product.find({ name: { $in: products.map((product) => product.name) } });
  return new Map(seededProducts.map((product) => [product.name, product._id]));
}

async function seedCategories() {
  await Category.bulkWrite(
    categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $set: {
            ...category,
            isActive: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
  );
}

async function seedCollections(productIdsByName: Map<string, mongoose.Types.ObjectId>) {
  await Collection.bulkWrite(
    collections.map((collection) => ({
      updateOne: {
        filter: { slug: collection.slug },
        update: {
          $set: {
            name: collection.name,
            season: collection.season,
            year: collection.year,
            description: collection.description,
            writeUp: collection.writeUp,
            coverImage: collection.coverImage,
            images: collection.images,
            productIds: collection.productNames
              .map((productName) => productIdsByName.get(productName))
              .filter(Boolean),
            featured: collection.featured,
            published: collection.published,
            publishDate: collection.publishDate,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
  );
}

async function seedSiteContent() {
  await SiteContent.bulkWrite(
    siteContent.map((item) => ({
      updateOne: {
        filter: { key: item.key },
        update: {
          $set: {
            ...item,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
  );
}

async function seedSizeGuide() {
  await SizeGuide.updateOne(
    {},
    {
      $set: {
        ...sizeGuide,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

async function seedPopup() {
  await Popup.updateOne(
    {},
    {
      $set: {
        ...popup,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

async function seedAdminFromEnv() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('No admin credentials found in env. Storefront was seeded, but admin login still needs an account.');
    }
    return;
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log(`Admin account already exists for ${email}.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: 'super_admin',
    isActive: true,
  });
  console.log(`Created admin account for ${email}.`);
}

async function clearStorefrontData() {
  await Promise.all([
    Collection.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    SiteContent.deleteMany({}),
    SizeGuide.deleteMany({}),
    Popup.deleteMany({}),
  ]);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  const forceReseed = process.argv.includes('--force');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  if (forceReseed) {
    console.log('Force reseed enabled. Clearing existing storefront content...');
    await clearStorefrontData();
  }

  const productIdsByName = await seedProducts();
  await seedCategories();
  await seedCollections(productIdsByName);
  await seedSiteContent();
  await seedSizeGuide();
  await seedPopup();
  await seedAdminFromEnv();

  const [productCount, categoryCount, collectionCount, siteContentCount, sizeGuideCount, popupCount, adminCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Collection.countDocuments(),
    SiteContent.countDocuments(),
    SizeGuide.countDocuments(),
    Popup.countDocuments(),
    Admin.countDocuments(),
  ]);

  console.log('\nSeed summary:');
  console.log(`  Products: ${productCount}`);
  console.log(`  Categories: ${categoryCount}`);
  console.log(`  Collections: ${collectionCount}`);
  console.log(`  Site content: ${siteContentCount}`);
  console.log(`  Size guides: ${sizeGuideCount}`);
  console.log(`  Popups: ${popupCount}`);
  console.log(`  Admin users: ${adminCount}`);
} 

main()
  .catch((error) => {
    console.error('Error seeding storefront:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  });
