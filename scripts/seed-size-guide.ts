import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
    envLoaded = true;
    console.log(`Loaded env from: ${envPath}`);
    break;
  }
}

if (!envLoaded) {
  console.error('No .env.local or .env file found');
  process.exit(1);
}

// SizeGuide Schema
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

const SizeGuide = mongoose.models.SizeGuide || mongoose.model('SizeGuide', SizeGuideSchema);

// Default size guide data
const defaultSizeGuide = {
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
    'Measure around the fullest part of your bust, keeping the tape parallel to the floor.',
    'Measure your waist at the thinnest place.',
    'Measure the fullest part of your hips.',
    'For tops: measure from the highest point of your shoulder to your desired length.',
    'Measure from the shoulder seam to your wrist bone with your arm slightly bent.',
  ],
  sizeTips: [
    'If you are between sizes, we recommend sizing up for a more comfortable fit.',
    'Structured ZIBARASTUDIO pieces are cut to hold shape, so take measurements before ordering.',
    'Handmade items may have slight variations of 1-2 cm from the listed measurements.',
    'For questions about sizing, please contact us before ordering.',
  ],
};

async function seedSizeGuide() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Check if size guide already exists
    const existing = await SizeGuide.findOne({});
    
    const forceReseed = process.argv.includes('--force');
    
    if (existing && !forceReseed) {
      console.log('Size guide already exists. Use --force to reseed.');
      await mongoose.disconnect();
      return;
    }

    if (existing && forceReseed) {
      console.log('Deleting existing size guide...');
      await SizeGuide.deleteMany({});
    }

    console.log('Creating size guide...');
    await SizeGuide.create(defaultSizeGuide);
    console.log('Size guide seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding size guide:', error);
    process.exit(1);
  }
}

seedSizeGuide();
