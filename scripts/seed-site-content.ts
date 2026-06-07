import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { SITE_CONTENT_DEFAULTS, ensureSiteContentDefaults } from '../lib/siteContentDefaults';

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

async function seedSiteContent() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const forceFlag = process.argv.includes('--force');

    if (forceFlag) {
      // Full reset — replaces every content block with the defaults.
      console.log('--force flag detected. Deleting existing content...');
      await SiteContent.deleteMany({});
      const result = await SiteContent.insertMany(SITE_CONTENT_DEFAULTS);
      console.log(`Successfully inserted ${result.length} site content items!`);
    } else {
      // Additive — inserts only missing blocks, preserves existing values.
      const before = await SiteContent.countDocuments();
      await ensureSiteContentDefaults(SiteContent);
      const after = await SiteContent.countDocuments();
      console.log(`Ensured site content defaults. Added ${after - before} new block(s); existing values preserved.`);
      console.log('Use --force to wipe and reseed all content from defaults.');
    }

    // Group by section
    const all = await SiteContent.find({});
    const sections: Record<string, number> = {};
    all.forEach((item: any) => {
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
