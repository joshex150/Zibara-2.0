'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  sizes: string[];
  colors?: ProductColor[];
  material: string;
  care: string[];
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  writeUp: string;
  coverImage: string;
  images: string[];
  productIds: string[] | Product[];
  featured: boolean;
  published: boolean;
  publishDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country?: string;
  };
  items: {
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color?: string;
    image: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  transactionId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  _id: string;
  key: string;
  type: 'text' | 'image' | 'richtext' | 'array';
  value: any;
  section: string;
  description: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMeasurement {
  size: string;
  bust: number;
  waist: number;
  hip: number;
  length: number;
  sleeve: number;
  cuff: number;
}

export interface BodyMeasurement {
  size: string;
  height: string;
  bust: string;
  waist: string;
  hip: string;
}

export interface SizeGuide {
  _id?: string;
  productMeasurements: ProductMeasurement[];
  bodyMeasurements: BodyMeasurement[];
  fitType: 'skinny' | 'regular' | 'oversized';
  stretch: 'none' | 'slight' | 'medium' | 'high';
  measurementTips: string[];
  sizeTips: string[];
  updatedAt?: string;
}

interface DataContextType {
  // Products
  products: Product[];
  productsLoading: boolean;
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  createProduct: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Collections
  collections: Collection[];
  collectionsLoading: boolean;
  fetchCollections: () => Promise<void>;
  getCollection: (slug: string) => Collection | undefined;
  createCollection: (collection: Omit<Collection, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Collection | null>;
  updateCollection: (id: string, collection: Partial<Collection>) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<boolean>;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, orderStatus: string, paymentStatus?: string) => Promise<Order | null>;

  // Site Content
  siteContent: SiteContent[];
  siteContentLoading: boolean;
  fetchSiteContent: (section?: string) => Promise<void>;
  getSiteContent: (key: string) => SiteContent | undefined;
  getContentValue: (key: string, defaultValue?: any) => any;
  updateSiteContent: (id: string, value: any) => Promise<SiteContent | null>;

  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  fetchCategories: () => Promise<void>;
  getCategoryNames: () => string[];

  // Size Guide
  sizeGuide: SizeGuide | null;
  sizeGuideLoading: boolean;
  fetchSizeGuide: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Site content state
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [siteContentLoading, setSiteContentLoading] = useState(true);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Size Guide state
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [sizeGuideLoading, setSizeGuideLoading] = useState(true);

  // ============ PRODUCTS ============
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find(p => p._id === id);
  }, [products]);

  const createProduct = useCallback(async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(prev => [...prev, data.data]);
        return data.data;
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
    return null;
  }, []);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(prev => prev.map(p => p._id === id ? data.data : p));
        return data.data;
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    return null;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    return false;
  }, []);

  // ============ COLLECTIONS ============
  const fetchCollections = useCallback(async () => {
    setCollectionsLoading(true);
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const getCollection = useCallback((slug: string) => {
    return collections.find(c => c.slug === slug);
  }, [collections]);

  const createCollection = useCallback(async (collection: Omit<Collection, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collection),
      });
      if (response.ok) {
        const data = await response.json();
        setCollections(prev => [...prev, data.data]);
        return data.data;
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
    return null;
  }, []);

  const updateCollection = useCallback(async (id: string, collection: Partial<Collection>) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collection),
      });
      if (response.ok) {
        const data = await response.json();
        setCollections(prev => prev.map(c => c._id === id ? data.data : c));
        return data.data;
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
    return null;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCollections(prev => prev.filter(c => c._id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
    return false;
  }, []);

  // ============ ORDERS ============
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, orderStatus: string, paymentStatus?: string) => {
    try {
      const body: any = { orderStatus };
      if (paymentStatus) body.paymentStatus = paymentStatus;
      
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(o => o._id === id ? data.data : o));
        return data.data;
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
    return null;
  }, []);

  // ============ SITE CONTENT ============
  const fetchSiteContent = useCallback(async (section?: string) => {
    setSiteContentLoading(true);
    try {
      const url = section ? `/api/site-content?section=${section}` : '/api/site-content';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSiteContent(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
    } finally {
      setSiteContentLoading(false);
    }
  }, []);

  const getSiteContent = useCallback((key: string) => {
    return siteContent.find(c => c.key === key);
  }, [siteContent]);

  // Helper to get content value directly
  const getContentValue = useCallback((key: string, defaultValue: any = '') => {
    const content = siteContent.find(c => c.key === key);
    return content?.value ?? defaultValue;
  }, [siteContent]);

  const updateSiteContent = useCallback(async (id: string, value: any) => {
    try {
      const response = await fetch(`/api/admin/site-content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (response.ok) {
        const data = await response.json();
        setSiteContent(prev => prev.map(c => c._id === id ? data.data : c));
        return data.data;
      }
    } catch (error) {
      console.error('Error updating site content:', error);
    }
    return null;
  }, []);

  // ============ CATEGORIES ============
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const getCategoryNames = useCallback(() => {
    return categories.map(c => c.name);
  }, [categories]);

  // ============ SIZE GUIDE ============
  const fetchSizeGuide = useCallback(async () => {
    setSizeGuideLoading(true);
    try {
      const response = await fetch('/api/size-guide');
      if (response.ok) {
        const data = await response.json();
        setSizeGuide(data.data || null);
      }
    } catch (error) {
      console.error('Error fetching size guide:', error);
    } finally {
      setSizeGuideLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
    fetchCollections();
    fetchSiteContent();
    fetchCategories();
    fetchSizeGuide();
  }, [fetchProducts, fetchCollections, fetchSiteContent, fetchCategories, fetchSizeGuide]);

  return (
    <DataContext.Provider
      value={{
        products,
        productsLoading,
        fetchProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,

        collections,
        collectionsLoading,
        fetchCollections,
        getCollection,
        createCollection,
        updateCollection,
        deleteCollection,

        orders,
        ordersLoading,
        fetchOrders,
        updateOrderStatus,

        siteContent,
        siteContentLoading,
        fetchSiteContent,
        getSiteContent,
        getContentValue,
        updateSiteContent,

        categories,
        categoriesLoading,
        fetchCategories,
        getCategoryNames,

        sizeGuide,
        sizeGuideLoading,
        fetchSizeGuide,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
