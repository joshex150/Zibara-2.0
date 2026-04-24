'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated.data);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.orderStatus === 'pending';
    if (filter === 'processing') return order.orderStatus === 'processing';
    if (filter === 'shipped') return order.orderStatus === 'shipped';
    if (filter === 'delivered') return order.orderStatus === 'delivered';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-900/30 text-yellow-400 border border-yellow-700/40';
      case 'processing':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-700/40';
      case 'shipped':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-purple-900/30 text-purple-400 border border-purple-700/40';
      case 'delivered':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/20 text-zibara-cream/65';
      case 'cancelled':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-crimson/40 text-zibara-crimson/80';
      default:
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/50';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/20 text-zibara-cream/65';
      case 'pending':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-900/30 text-yellow-400 border border-yellow-700/40';
      case 'failed':
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-crimson/40 text-zibara-crimson/80';
      default:
        return 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/50';
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Orders" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-zibara-cream/5 pb-8 mb-10">
          <Link
            href="/admin"
            className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Operations</p>
            <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
              Orders
            </h1>
            <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
              {orders.length} total order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `All (${orders.length})` },
            { key: 'pending', label: `Pending (${orders.filter(o => o.orderStatus === 'pending').length})` },
            { key: 'processing', label: `Processing (${orders.filter(o => o.orderStatus === 'processing').length})` },
            { key: 'shipped', label: `Shipped (${orders.filter(o => o.orderStatus === 'shipped').length})` },
            { key: 'delivered', label: `Delivered (${orders.filter(o => o.orderStatus === 'delivered').length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key
                ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
                : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <Package className="w-8 h-8 mx-auto text-zibara-cream/20 mb-4" />
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-2">No orders found</p>
            <p className="text-[11px] font-mono text-zibara-cream/40">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-px bg-zibara-cream/5 border border-zibara-cream/5">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-zibara-black p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zibara-cream">{order.orderNumber}</p>
                      <p className="text-[11px] font-mono text-zibara-cream/65 mt-0.5">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <p className="text-[11px] font-mono text-zibara-cream">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={getStatusBadge(order.orderStatus)}>{order.orderStatus}</span>
                    <span className={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</span>
                    <span className="text-[9px] font-mono text-zibara-cream/40 ml-auto">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full px-4 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border border-zibara-cream/10 bg-zibara-deep">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zibara-cream/8">
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Order #</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Customer</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Total</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Status</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Payment</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Date</th>
                      <th className="px-5 py-3 text-left text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.4em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b border-zibara-cream/8 hover:bg-zibara-cream/2 transition-colors">
                        <td className="px-5 py-4 text-[10px] font-mono text-zibara-cream uppercase tracking-[0.1em]">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4 text-[11px] font-mono text-zibara-cream/80">
                          {order.customer.firstName} {order.customer.lastName}
                        </td>
                        <td className="px-5 py-4 text-[11px] font-mono text-zibara-cream">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={getStatusBadge(order.orderStatus)}>{order.orderStatus}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</span>
                        </td>
                        <td className="px-5 py-4 text-[11px] font-mono text-zibara-cream/55">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[10px] font-mono uppercase tracking-[0.2em] text-zibara-cream/60 hover:text-zibara-cream transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-zibara-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zibara-deep border border-zibara-cream/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zibara-cream/8 flex justify-between items-start">
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">Order Details</p>
                  <h2 className="font-cormorant text-2xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                    {selectedOrder.orderNumber}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Customer Information</p>
                  <div className="text-[11px] font-mono text-zibara-cream/65 space-y-1">
                    <p className="text-zibara-cream">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                    <p>{selectedOrder.customer.email}</p>
                    {selectedOrder.customer.phone && <p>{selectedOrder.customer.phone}</p>}
                    {selectedOrder.customer.address && (
                      <>
                        <p className="pt-1">{selectedOrder.customer.address}</p>
                        <p>
                          {selectedOrder.customer.city}
                          {selectedOrder.customer.state && `, ${selectedOrder.customer.state}`}
                          {selectedOrder.customer.zipCode && ` ${selectedOrder.customer.zipCode}`}
                        </p>
                        {selectedOrder.customer.country && <p>{selectedOrder.customer.country}</p>}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Update Status</p>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-[11px] font-mono focus:ring-zibara-gold/50 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Items */}
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Items</p>
                  <div className="space-y-px bg-zibara-cream/5">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-zibara-black">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-mono text-zibara-cream uppercase tracking-[0.1em] truncate">{item.name}</p>
                          <p className="text-[9px] font-mono text-zibara-cream/55 uppercase tracking-[0.2em] mt-0.5">
                            Size: {item.size}
                            {item.color ? ` · ${item.color}` : ''} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-[11px] font-mono text-zibara-cream shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-zibara-cream/8 pt-4 flex justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Total</span>
                  <span className="text-[11px] font-mono text-zibara-cream">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
