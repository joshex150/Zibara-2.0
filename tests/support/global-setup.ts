import fs from 'fs';
import path from 'path';
import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
  E2E_CATEGORY_NAME,
  E2E_CATEGORY_SLUG,
  E2E_CUSTOMER_EMAIL,
} from './e2e-constants';

const loadEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] ||= value;
  }
};

async function globalSetup() {
  loadEnvFile();

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to run Zibara E2E tests.');
  }

  process.env.E2E_TEST_MODE = '1';
  process.env.E2E_ARTIFACT_DIR = path.join(process.cwd(), '.test-artifacts');
  await fs.promises.mkdir(process.env.E2E_ARTIFACT_DIR, { recursive: true });
  await fs.promises.rm(path.join(process.env.E2E_ARTIFACT_DIR, 'emails.jsonl'), { force: true });

  const [bcrypt, mongoose] = await Promise.all([
    import('bcryptjs'),
    import('mongoose'),
  ]);

  await mongoose.default.connect(process.env.MONGODB_URI);

  const looseSchema = new mongoose.default.Schema({}, { strict: false });
  const Admin = mongoose.default.models.Admin || mongoose.default.model('Admin', looseSchema);
  const Category = mongoose.default.models.Category || mongoose.default.model('Category', looseSchema);
  const Product = mongoose.default.models.Product || mongoose.default.model('Product', looseSchema);
  const Order = mongoose.default.models.Order || mongoose.default.model('Order', looseSchema);

  await Promise.all([
    Product.deleteMany({ name: /^E2E Zibara Critical Path/ }),
    Order.deleteMany({ 'customer.email': E2E_CUSTOMER_EMAIL }),
  ]);

  await Category.updateOne(
    { slug: E2E_CATEGORY_SLUG },
    {
      $set: {
        name: E2E_CATEGORY_NAME,
        slug: E2E_CATEGORY_SLUG,
        description: 'Category created by the Zibara critical-path E2E test.',
        image: '/zibara.png',
        order: 999,
        isActive: true,
      },
    },
    { upsert: true },
  );

  await Admin.updateOne(
    { email: E2E_ADMIN_EMAIL },
    {
      $set: {
        email: E2E_ADMIN_EMAIL,
        password: await bcrypt.default.hash(E2E_ADMIN_PASSWORD, 10),
        name: 'Zibara E2E Admin',
        role: 'super_admin',
        isActive: true,
      },
    },
    { upsert: true },
  );

  await mongoose.default.disconnect();
}

export default globalSetup;
