import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Collection from '@/models/Collection';
import Category from '@/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zibarastudio.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    await connectDB();

    // Fetch all products
    const products = await Product.find({ inStock: true }).select('_id updatedAt').lean();
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch all published collections
    const collections = await Collection.find({ published: true }).select('slug updatedAt').lean();
    const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: collection.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Fetch all active categories
    const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean();
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database fails
    return staticPages;
  }
}
