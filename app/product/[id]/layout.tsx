import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    const productUrl = `https://crochellaa.ng/product/${id}`;
    
    // Get the first product image and ensure it's an absolute URL
    let productImage = product.images?.[0] || 'https://crochellaa.ng/android-chrome-512x512.png';
    
    // Ensure the image URL is absolute
    if (productImage && !productImage.startsWith('http://') && !productImage.startsWith('https://')) {
      productImage = `https://crochellaa.ng${productImage.startsWith('/') ? '' : '/'}${productImage}`;
    }
    
    // If it's a Cloudinary URL, optimize it for Open Graph (1200x630 is the recommended size)
    // Cloudinary transformation: w_1200,h_630,c_fill for optimal social sharing
    if (productImage.includes('res.cloudinary.com') && productImage.includes('/image/upload/')) {
      // Check if a transformation already exists (there's a segment between /image/upload/ and the filename)
      // Cloudinary URL format: .../image/upload/{transformation}/{public_id}.{format}
      // or: .../image/upload/{public_id}.{format} (no transformation)
      const uploadIndex = productImage.indexOf('/image/upload/');
      if (uploadIndex !== -1) {
        const afterUpload = productImage.substring(uploadIndex + '/image/upload/'.length);
        // If there's no slash before the filename (no transformation), add one
        // Or if the first segment doesn't look like a transformation (contains dots, which would be the filename)
        if (!afterUpload.includes('/') || afterUpload.split('/')[0].includes('.')) {
          // No transformation exists, add it
          productImage = productImage.replace('/image/upload/', '/image/upload/w_1200,h_630,c_fill/');
        }
      }
    }

    return {
      title: product.name,
      description: product.description || `Shop ${product.name} - Handmade crochet fashion from Crochellaa.ng`,
      keywords: [
        product.name,
        product.category,
        'crochet',
        'handmade fashion',
        'sustainable fashion',
        'artisan clothing',
        'Crochellaa',
      ],
      openGraph: {
        type: 'website',
        url: productUrl,
        title: product.name,
        description: product.description || `Shop ${product.name} - Handmade crochet fashion`,
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: 'Crochellaa.ng',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Shop ${product.name} - Handmade crochet fashion`,
        images: [productImage],
      },
      alternates: {
        canonical: productUrl,
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product',
      description: 'Handmade crochet fashion from Crochellaa.ng',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
