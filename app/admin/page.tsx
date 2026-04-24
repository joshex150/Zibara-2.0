'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  TrendingUp,
  DollarSign,
  Eye,
  LogOut,
  MessageSquare,
  FolderOpen,
  Ruler,
  Palette,
  Megaphone,
  Coins
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    unreadMessages: 0,
    totalCustomOrders: 0,
    pendingCustomOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to fetch with retry
  const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Try to parse error response
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          } catch {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        const jsonData = await response.json();
        
        // Handle API response structure: { success: true, data: [...] } or { success: false, error: ... }
        if (jsonData.success && jsonData.data !== undefined) {
          return { success: true, data: jsonData.data };
        } else if (jsonData.success === false) {
          throw new Error(jsonData.error || 'API returned success: false');
        } else {
          // If response doesn't have expected structure, assume the whole response is the data
          return { success: true, data: jsonData.data || jsonData || [] };
        }
      } catch (error: any) {
        if (i === retries - 1) {
          console.error(`Failed to fetch ${url} after ${retries} attempts:`, error);
          return { success: false, data: null, error: error.message };
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    return { success: false, data: null };
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all APIs with retry logic and handle failures gracefully
      const [productsResult, ordersResult, messagesResult, customOrdersResult] = await Promise.allSettled([
        fetchWithRetry('/api/admin/products'),
        fetchWithRetry('/api/admin/orders'),
        fetchWithRetry('/api/admin/messages'),
        fetchWithRetry('/api/admin/custom-orders'),
      ]);

      // Extract data from settled promises, with fallback to empty arrays
      // Check if the promise was fulfilled AND the API call was successful
      const products = productsResult.status === 'fulfilled' && productsResult.value?.success
        ? (productsResult.value.data || [])
        : [];
      
      const orders = ordersResult.status === 'fulfilled' && ordersResult.value?.success
        ? (ordersResult.value.data || [])
        : [];
      
      const messages = messagesResult.status === 'fulfilled' && messagesResult.value?.success
        ? (messagesResult.value.data || [])
        : [];
      
      const customOrders = customOrdersResult.status === 'fulfilled' && customOrdersResult.value?.success
        ? (customOrdersResult.value.data || [])
        : [];

      // Check if any API calls actually failed (not just returned empty data)
      const failedCount = [
        productsResult.status === 'rejected' || (productsResult.status === 'fulfilled' && !productsResult.value?.success),
        ordersResult.status === 'rejected' || (ordersResult.status === 'fulfilled' && !ordersResult.value?.success),
        messagesResult.status === 'rejected' || (messagesResult.status === 'fulfilled' && !messagesResult.value?.success),
        customOrdersResult.status === 'rejected' || (customOrdersResult.status === 'fulfilled' && !customOrdersResult.value?.success),
      ].filter(Boolean).length;
      
      const allFailed = failedCount === 4;
      const someFailed = failedCount > 0 && failedCount < 4;
      
      // Only show error if ALL API calls failed (not if they just returned empty arrays)
      // Always clear error and reset retry count if at least one API succeeded
      if (allFailed && retryCount < 2) {
        // If all requests failed, set error but still show the dashboard with zeros
        setError('Unable to load dashboard data. Retrying...');
      } else if (allFailed) {
        // After retries, show persistent error but still display dashboard
        setError('Unable to load dashboard data. Some statistics may be unavailable.');
      } else {
        // Clear error if at least one API succeeded
        setError(null);
        setRetryCount(0);
      }
      
      // Log for debugging
      if (someFailed) {
        console.warn(`Dashboard: ${failedCount} out of 4 API calls failed, but showing available data`);
      }

      // Calculate stats with safe defaults
      const pendingOrders = Array.isArray(orders)
        ? orders.filter((order: any) => order?.orderStatus === 'pending').length
        : 0;

      // Calculate total revenue (all time)
      const totalRevenue = Array.isArray(orders)
        ? orders
            .filter((order: any) => order?.paymentStatus === 'paid')
            .reduce((sum: number, order: any) => sum + (order?.total || 0), 0)
        : 0;

      // Calculate monthly revenue (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = Array.isArray(orders)
        ? orders
            .filter((order: any) => {
              if (!order?.createdAt) return false;
              const orderDate = new Date(order.createdAt);
              return order.paymentStatus === 'paid' && orderDate >= startOfMonth;
            })
            .reduce((sum: number, order: any) => sum + (order?.total || 0), 0)
        : 0;

      // Count unread messages
      const unreadMessages = Array.isArray(messages)
        ? messages.filter((message: any) => !message?.read).length
        : 0;

      // Count custom orders
      const totalCustomOrders = Array.isArray(customOrders) ? customOrders.length : 0;
      const pendingCustomOrders = Array.isArray(customOrders)
        ? customOrders.filter((order: any) => order?.status === 'pending').length
        : 0;

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        pendingOrders,
        totalRevenue,
        monthlyRevenue,
        unreadMessages,
        totalCustomOrders,
        pendingCustomOrders,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError('An unexpected error occurred. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      setRetryCount(0); // Reset retry count on new session
      fetchStats();
    }
  }, [status, router, fetchStats]);

  // Auto-retry on complete failure (max 2 additional retries)
  useEffect(() => {
    if (error && retryCount < 2 && !loading && status === 'authenticated') {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchStats();
      }, 3000); // Retry after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loading, fetchStats, status]);

  if (status === 'loading' || loading) return <BrandLoader label="Admin" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      title: 'Products',
      description: 'Manage product catalog',
      href: '/admin/products',
      icon: Package,
    },
    {
      title: 'Categories',
      description: 'Manage product categories',
      href: '/admin/categories',
      icon: FolderOpen,
    },
    {
      title: 'Collections',
      description: 'Manage seasonal drops',
      href: '/admin/collections',
      icon: TrendingUp,
    },
    {
      title: 'Orders',
      description: 'View and manage orders',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Messages',
      description: 'View customer messages',
      href: '/admin/messages',
      icon: MessageSquare,
    },
    {
      title: 'Custom Orders',
      description: 'Manage custom requests',
      href: '/admin/custom-orders',
      icon: Palette,
    },
    {
      title: 'Site Content',
      description: 'Edit site text and images',
      href: '/admin/site-content',
      icon: FileText,
    },
    {
      title: 'Size Guide',
      description: 'Manage size chart',
      href: '/admin/size-guide',
      icon: Ruler,
    },
    {
      title: 'Popup Notice',
      description: 'Manage site announcement',
      href: '/admin/popup',
      icon: Megaphone,
    },
    {
      title: 'Currency Rates',
      description: 'Manage currency conversion rates',
      href: '/admin/currency',
      icon: Coins,
    },
    {
      title: 'View Site',
      description: 'Go to main website',
      href: '/',
      icon: Eye,
    },
  ];

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: TrendingUp,
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
    },
    {
      title: 'Custom Orders',
      value: stats.totalCustomOrders,
      icon: Palette,
    },
    {
      title: 'Pending Custom Orders',
      value: stats.pendingCustomOrders,
      icon: Palette,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">

        {/* Header */}
        <div className="mb-12 border-b border-zibara-cream/5 pb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">
              ZIBARASTUDIO Management
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-light uppercase tracking-[0.15em] leading-none text-zibara-cream"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Dashboard
            </h1>
            <p className="text-[10px] font-mono text-zibara-cream/55 uppercase tracking-[0.3em] mt-3">
              Welcome back — {session.user?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRetryCount(0); setError(null); fetchStats(); }}
              className="px-5 py-2 border border-zibara-cream/25 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/70 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-zibara-crimson/10 border border-zibara-crimson/30 text-zibara-cream/80 text-[11px] font-mono">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-4">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-6">Overview</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zibara-cream/5 border border-zibara-cream/5 mb-14">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-zibara-black p-5 md:p-6 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between">
                <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 leading-relaxed max-w-[120px]">
                  {stat.title}
                </p>
                <stat.icon className="w-4 h-4 text-zibara-cream/30 shrink-0 mt-0.5" />
              </div>
              <p
                className="text-3xl md:text-4xl font-light text-zibara-cream tracking-tight"
                style={{ fontFamily: 'var(--font-cormorant), serif' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="mb-4">
          <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-6">Manage</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-zibara-cream/5 border border-zibara-cream/5">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group bg-zibara-black p-5 md:p-6 flex flex-col gap-4 hover:bg-zibara-deep transition-colors"
            >
              <item.icon className="w-5 h-5 text-zibara-cream/40 group-hover:text-zibara-cream/70 transition-colors" />
              <div>
                <p
                  className="text-base font-light uppercase tracking-[0.2em] text-zibara-cream/85 group-hover:text-zibara-cream transition-colors mb-1"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}
                >
                  {item.title}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zibara-cream/45 group-hover:text-zibara-cream/60 transition-colors leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
