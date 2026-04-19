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

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Generate random price between $200 and $800
function getRandomPrice(): number {
  const min = 200;
  const max = 800;
  // Generate random price with 2 decimal places
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function updateProductPrices() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log('No products found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update each product with a random price between $200 and $800
    let updatedCount = 0;
    for (const product of products) {
      const newPrice = getRandomPrice();
      await Product.updateOne(
        { _id: product._id },
        { $set: { price: newPrice, updatedAt: new Date() } }
      );
      console.log(`Updated ${product.name}: $${product.price.toFixed(2)} → $${newPrice.toFixed(2)}`);
      updatedCount++;
    }

    console.log(`\nSuccessfully updated ${updatedCount} products with prices between $200-$800!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating product prices:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateProductPrices();
