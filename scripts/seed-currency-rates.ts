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

// Define schema inline (like other seed scripts)
const CurrencyRateSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CurrencyRateSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const CurrencyRate = mongoose.models.CurrencyRate || mongoose.model('CurrencyRate', CurrencyRateSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

async function seedCurrencyRates() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const defaultRates = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        rate: 1,
        isActive: true,
      },
      {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        rate: 1500,
        isActive: true,
      },
    ];

    for (const rate of defaultRates) {
      const existing = await CurrencyRate.findOne({ code: rate.code });
      if (existing) {
        await CurrencyRate.updateOne(
          { code: rate.code },
          { $set: { ...rate, updatedAt: new Date() } }
        );
        console.log(`Updated currency rate for ${rate.code}`);
      } else {
        await CurrencyRate.create(rate);
        console.log(`Created currency rate for ${rate.code}`);
      }
    }

    console.log('Currency rates seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding currency rates:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedCurrencyRates();
