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
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) return <BrandLoader label="Orders" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] scroll-mt-32 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Link 
            href="/admin"
            className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors shrink-0"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5 text-[#8b2b4d]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8b2b4d] uppercase tracking-wider">
              Orders
            </h1>
            <p className="text-gray-700 text-xs md:text-sm mt-1">
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
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'pending'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            Pending ({orders.filter(o => o.orderStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'processing'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            Processing ({orders.filter(o => o.orderStatus === 'processing').length})
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'shipped'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            Shipped ({orders.filter(o => o.orderStatus === 'shipped').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'delivered'
                ? 'bg-[#8b2b4d] text-white'
                : 'bg-[#f5d5e5] text-gray-700 hover:bg-[#d896b5]/30'
            }`}
          >
            Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
          </button>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#8b2b4d] rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <Package className="w-10 h-10 md:w-12 md:h-12 mx-auto text-white/60 mb-3 md:mb-4" />
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No orders found</p>
            <p className="text-xs md:text-sm text-white/80">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-[#f5d5e5] rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-600">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <p className="text-sm font-bold text-[#8b2b4d]">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-auto">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-[#8b2b4d] text-white py-2 rounded text-xs font-semibold hover:bg-[#6d1f3a] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#f5d5e5] rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#8b2b4d] hover:text-[#6d1f3a] font-semibold"
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
            <div className="bg-[#f5d5e5] rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                      Order Details
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      {selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl md:text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Customer Information</h3>
                  <div className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
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
                  <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Order Status</h3>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    className="w-full md:w-[148px] px-3 py-2 border border-[#8b2b4d]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent text-sm bg-[#f5d5e5] text-[#8b2b4d]"
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
                  <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 md:gap-4 p-2 md:p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-xs md:text-base truncate">{item.name}</p>
                          <p className="text-[10px] md:text-sm text-gray-600">
                            Size: {item.size}
                            {item.color ? ` • ${item.color}` : ''} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 text-xs md:text-base shrink-0">
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
