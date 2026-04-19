import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually
const envPaths = [
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
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

// Category Schema
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

// Product Schema (simplified for reading)
const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true },
  images: { type: [String], required: true },
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const defaultCategories = [
  { name: 'Tops', description: 'Handmade crochet tops and blouses' },
  { name: 'Dresses', description: 'Elegant crochet dresses for every occasion' },
  { name: 'Bottoms', description: 'Stylish crochet pants and skirts' },
  { name: 'Sets', description: 'Matching crochet outfit sets' },
  { name: 'Rompers', description: 'Cute and comfortable crochet rompers' },
  { name: 'Accessories', description: 'Bags, hats, and more crochet accessories' },
];

async function seedCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const forceReseed = process.argv.includes('--force');
    
    // Check existing categories
    const existingCount = await Category.countDocuments();
    if (existingCount > 0 && !forceReseed) {
      console.log(`Found ${existingCount} existing categories. Use --force to reseed.`);
      await mongoose.disconnect();
      return;
    }

    if (forceReseed) {
      console.log('Force reseed: Deleting existing categories...');
      await Category.deleteMany({});
    }

    // Get unique categories from existing products
    const products = await Product.find({});
    const productCategories = [...new Set(products.map(p => p.category))];
    
    console.log(`Found ${productCategories.length} categories from products:`, productCategories);

    // Create categories
    const categoriesToCreate = [];
    
    for (let i = 0; i < defaultCategories.length; i++) {
      const cat = defaultCategories[i];
      const slug = cat.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Find a product with this category to get an image
      const productWithCategory = products.find(p => p.category === cat.name);
      const image = productWithCategory?.images?.[0] || '';
      
      categoriesToCreate.push({
        name: cat.name,
        slug,
        description: cat.description,
        image,
        order: i,
        isActive: true,
      });
    }

    // Also add any categories from products that aren't in defaults
    for (const catName of productCategories) {
      if (!defaultCategories.find(d => d.name === catName)) {
        const slug = catName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        const productWithCategory = products.find(p => p.category === catName);
        const image = productWithCategory?.images?.[0] || '';
        
        categoriesToCreate.push({
          name: catName,
          slug,
          description: '',
          image,
          order: categoriesToCreate.length,
          isActive: true,
        });
      }
    }

    console.log(`Creating ${categoriesToCreate.length} categories...`);
    await Category.insertMany(categoriesToCreate);

    console.log('Categories seeded successfully!');
    
    // List created categories
    const created = await Category.find({}).sort({ order: 1 });
    console.log('\nCreated categories:');
    created.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
