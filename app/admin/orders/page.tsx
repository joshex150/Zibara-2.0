'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Package } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'processing':
        return 'bg-blue-900/40 text-blue-300';
      case 'shipped':
        return 'bg-purple-900/40 text-purple-300';
      case 'delivered':
        return 'bg-green-900/40 text-green-300';
      case 'cancelled':
        return 'bg-red-900/40 text-red-300';
      default:
        return 'bg-zinc-700 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-900/40 text-green-300';
      case 'pending':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'failed':
        return 'bg-red-900/40 text-red-300';
      default:
        return 'bg-zinc-700 text-gray-800';
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Orders" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 scroll-mt-32 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Link 
            href="/admin"
            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-zibara-cream" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zibara-cream uppercase tracking-wider">
              Orders
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm mt-1">
              Manage customer orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'all'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'pending'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Pending ({orders.filter(o => o.orderStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'processing'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Processing ({orders.filter(o => o.orderStatus === 'processing').length})
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'shipped'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Shipped ({orders.filter(o => o.orderStatus === 'shipped').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'delivered'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
          </button>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="bg-zibara-crimson rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <Package className="w-10 h-10 md:w-12 md:h-12 mx-auto text-white/60 mb-3 md:mb-4" />
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No orders found</p>
            <p className="text-xs md:text-sm text-white/80">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-zinc-800 rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-100">{order.orderNumber}</p>
                      <p className="text-[10px] text-zinc-400">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <p className="text-sm font-bold text-zibara-cream">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-auto">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-zibara-crimson text-white py-2 rounded text-xs font-semibold hover:bg-zibara-blood transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-zinc-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/60 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-zinc-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                          {order.customer.firstName} {order.customer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-100">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-zibara-cream hover:text-zinc-300 font-semibold"
                          >
                            View Details
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-zinc-800 rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-zinc-100 mb-1 md:mb-2">
                      Order Details
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-400">
                      {selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-zinc-500 hover:text-zinc-400 text-xl md:text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1 md:mb-2 text-sm md:text-base">Customer Information</h3>
                  <div className="text-xs md:text-sm text-zinc-400 space-y-0.5 md:space-y-1">
                    <p className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
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
                  <h3 className="font-semibold text-zinc-100 mb-1 md:mb-2 text-sm md:text-base">Order Status</h3>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    className="w-full md:w-[148px] px-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent text-sm bg-zinc-800 text-zibara-cream"
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
                  <h3 className="font-semibold text-zinc-100 mb-1 md:mb-2 text-sm md:text-base">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 md:gap-4 p-2 md:p-3 bg-zinc-800/60 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-100 text-xs md:text-base truncate">{item.name}</p>
                          <p className="text-[10px] md:text-sm text-zinc-400">
                            Size: {item.size}
                            {item.color ? ` • ${item.color}` : ''} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-zinc-100 text-xs md:text-base shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-3 md:pt-4">
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
