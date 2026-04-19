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

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  category: { type: String, required: true },
  sizes: { type: [String], default: [] },
  material: { type: String, default: '' },
  care: { type: [String], default: [] },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

function priceBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const MATERIAL_BASE = 'Ethically sourced Nigerian textiles. Finished by hand in Lagos.';
const CARE_BASE = ['Dry clean only', 'Store on padded hanger', 'Protect from direct sunlight'];

const dummyProducts = [
  {
    name: 'LUMA SHEATH DRESS',
    price: priceBetween(420, 620),
    description: 'Sculpted sheath silhouette in structured crepe. Cut to trace the spine without apology — designed for the woman who enters and the room reorganises around her.',
    images: [],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Structured Italian crepe with silk lining.`,
    care: CARE_BASE,
    inStock: true,
    featured: true,
  },
  {
    name: 'IBEJI CORSET',
    price: priceBetween(360, 540),
    description: 'Architectural corset in compressed matte satin. Boned inner structure, silk-bound hem, back lacing in waxed cord. Worn alone or layered under open tailoring.',
    images: [],
    category: 'Corsetry',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Compressed satin with internal boning.`,
    care: CARE_BASE,
    inStock: true,
    featured: true,
  },
  {
    name: 'ZIBARA COAT — OBSIDIAN',
    price: priceBetween(780, 1100),
    description: 'Floor-length overcoat in obsidian wool with dropped shoulder and unfastened front. A piece of architecture you walk inside of.',
    images: [],
    category: 'Outerwear',
    sizes: ['S', 'M', 'L'],
    material: `${MATERIAL_BASE} Virgin wool shell with viscose lining.`,
    care: CARE_BASE,
    inStock: true,
    featured: true,
  },
  {
    name: 'OSHUN SLIP',
    price: priceBetween(280, 420),
    description: 'Bias-cut floor slip in weighted silk charmeuse. Spaghetti strap, cowl back, shoulders left bare. Intended for rooms that finish late.',
    images: [],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} 100% silk charmeuse.`,
    care: CARE_BASE,
    inStock: true,
    featured: false,
  },
  {
    name: 'YORUBA TROUSER',
    price: priceBetween(320, 480),
    description: 'High-rise tailored trouser with fluid leg and concealed side zip. Drapes like water, holds like intent.',
    images: [],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: `${MATERIAL_BASE} Tencel-wool blend.`,
    care: CARE_BASE,
    inStock: true,
    featured: false,
  },
  {
    name: 'ASHÉ BLAZER',
    price: priceBetween(520, 760),
    description: 'Double-breasted blazer, extended shoulder, raw inner construction. Engineered to be worn closed — the silhouette speaks first.',
    images: [],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Worsted wool, hand-finished lapels.`,
    care: CARE_BASE,
    inStock: true,
    featured: true,
  },
  {
    name: 'NOKTURNE GOWN',
    price: priceBetween(720, 980),
    description: 'Floor-sweeping gown in compressed crimson silk. Plunge front, backless, sculpted torso. Ceremonial in posture.',
    images: [],
    category: 'Evening',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Compressed silk faille.`,
    care: CARE_BASE,
    inStock: true,
    featured: true,
  },
  {
    name: 'EBUN MIDI',
    price: priceBetween(340, 500),
    description: 'Column midi with mandarin collar and covered placket. Reads severe at rest, elegant in motion.',
    images: [],
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Double-face crepe.`,
    care: CARE_BASE,
    inStock: true,
    featured: false,
  },
  {
    name: 'IFÉ BUSTIER',
    price: priceBetween(260, 400),
    description: 'Hard-shouldered bustier in polished leather. Structured cup, back boning, hidden zip. Built to carry the eye.',
    images: [],
    category: 'Corsetry',
    sizes: ['XS', 'S', 'M', 'L'],
    material: `${MATERIAL_BASE} Lamb leather, fully lined.`,
    care: ['Leather specialist cleaning only', 'Store upright', 'Protect from moisture'],
    inStock: true,
    featured: false,
  },
  {
    name: 'DAMA SKIRT',
    price: priceBetween(290, 440),
    description: 'Column skirt with back vent and mid-rise waist. Moves with the walk, holds the line when still.',
    images: [],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: `${MATERIAL_BASE} Heavy crepe.`,
    care: CARE_BASE,
    inStock: true,
    featured: false,
  },
  {
    name: 'AYABA CAPE',
    price: priceBetween(540, 780),
    description: 'Floor-length cape with concealed arm slits and sculpted collar. Royalty, re-engineered.',
    images: [],
    category: 'Outerwear',
    sizes: ['ONE SIZE'],
    material: `${MATERIAL_BASE} Wool-cashmere blend.`,
    care: CARE_BASE,
    inStock: true,
    featured: false,
  },
  {
    name: 'OBSIDIA GLOVE',
    price: priceBetween(120, 220),
    description: 'Opera-length glove in matte obsidian leather. Hand-stitched gusset, silk-lined cuff.',
    images: [],
    category: 'Accessories',
    sizes: ['S', 'M', 'L'],
    material: `${MATERIAL_BASE} Lamb leather, silk lining.`,
    care: ['Leather specialist cleaning only', 'Store flat', 'Protect from moisture'],
    inStock: true,
    featured: false,
  },
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing products.`);
      const answer = process.argv.includes('--force') ? 'y' : 'n';
      if (answer !== 'y') {
        console.log('Use --force flag to add products anyway. Exiting...');
        process.exit(0);
      }
    }

    console.log('Inserting dummy products...');
    const result = await Product.insertMany(dummyProducts);
    console.log(`Successfully inserted ${result.length} products!`);

    // Log inserted products
    result.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price}`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProducts();
