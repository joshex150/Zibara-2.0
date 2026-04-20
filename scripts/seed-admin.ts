import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
    break;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function seedAdmin() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    console.log('\nCreating admin user...');
    const name = process.env.ADMIN_NAME || (await getUserInput('Name: '));
    const email = process.env.ADMIN_EMAIL || (await getUserInput('Email: '));
    const password = process.env.ADMIN_PASSWORD || (await getUserInput('Password: '));

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('\n✓ Admin with this email already exists.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });

    console.log('✓ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
