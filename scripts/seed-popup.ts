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

const Popup = mongoose.models.Popup || mongoose.model('Popup', PopupSchema);

async function seedPopup() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    // Check if popup already exists
    const existing = await Popup.findOne();
    const forceFlag = process.argv.includes('--force');

    if (existing && !forceFlag) {
      console.log('Popup already exists. Use --force to replace it.');
      process.exit(0);
    }

    if (existing && forceFlag) {
      console.log('Deleting existing popup...');
      await Popup.deleteMany({});
    }

    console.log('Creating branded popup...');
    
    const popupData = {
      enabled: false,
      title: 'PRIVATE ACCESS',
      message: 'Welcome to ZIBARASTUDIO.\n\nFor nights that matter.\n\nUse this space for salon drops, atelier appointments, or event-specific notices.',
      showButton: true,
      buttonText: 'Explore the Collection',
      buttonLink: '/shop',
      showOnce: true,
    };

    const popup = await Popup.create(popupData);
    console.log('Popup created successfully!');
    console.log('\nPopup Details:');
    console.log(`  Enabled: ${popup.enabled}`);
    console.log(`  Title: ${popup.title}`);
    console.log(`  Show Button: ${popup.showButton}`);
    console.log(`  Button Text: ${popup.buttonText}`);
    console.log(`  Button Link: ${popup.buttonLink}`);
    console.log(`  Show Once: ${popup.showOnce}`);

  } catch (error) {
    console.error('Error seeding popup:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedPopup();
