import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { absoluteUrl, BRAND_ICON, getCloudinaryOgImage, SITE_NAME } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
        robots: { index: false, follow: false },
      };
    }

    const productUrl = `https://zibara.store/product/${id}`;
    
    // Get the first product image and ensure it's an absolute URL
    let productImage = product.images?.[0] || BRAND_ICON;
    
    // Ensure the image URL is absolute
    productImage = absoluteUrl(productImage);
    
    // If it's a Cloudinary URL, optimize it for Open Graph (1200x630 is the recommended size)
    productImage = getCloudinaryOgImage(productImage);

    return {
      title: product.name,
      description: product.description || `Shop ${product.name} from ZIBARASTUDIO. Afro-futurist luxury fashion for nights that matter.`,
      keywords: [
        product.name,
        product.category,
        'ZIBARASTUDIO',
        'Afro-futurism',
        'luxury fashion',
        'Lagos fashion',
      ],
      openGraph: {
        type: 'website',
        url: productUrl,
        title: product.name,
        description: product.description || `Shop ${product.name} from ZIBARASTUDIO.`,
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: SITE_NAME,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Shop ${product.name} from ZIBARASTUDIO.`,
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
      description: 'Afro-futurist luxury fashion from ZIBARASTUDIO.',
    };
  }
}

export default async function ProductLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  let productJsonLd = null;

  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (product) {
      const image = absoluteUrl(getCloudinaryOgImage(product.images?.[0] || BRAND_ICON));
      productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image,
        brand: {
          '@type': 'Brand',
          name: SITE_NAME,
        },
        category: product.category,
        offers: {
          '@type': 'Offer',
          url: `https://zibara.store/product/${id}`,
          priceCurrency: 'USD',
          price: product.price,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      };
    }
  } catch (error) {
    console.error('Error generating product JSON-LD:', error);
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
