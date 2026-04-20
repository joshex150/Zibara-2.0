'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Palette, Trash2, Mail, Phone } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface CustomOrder {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  itemType: string;
  description: string;
  colors: string[];
  referenceImages?: string[];
  measurements?: {
    bust?: number;
    waist?: number;
    hip?: number;
    length?: number;
    other?: string;
  };
  budget?: string;
  deadline?: string;
  additionalNotes?: string;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300',
  contacted: 'bg-blue-900/40 text-blue-300',
  in_progress: 'bg-purple-900/40 text-purple-300',
  completed: 'bg-green-900/40 text-green-300',
  cancelled: 'bg-zinc-700 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AdminCustomOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/custom-orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching custom orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setOrders(prev => prev.map(o => 
          o._id === id ? { ...o, status: newStatus as CustomOrder['status'] } : o
        ));
        if (selectedOrder?._id === id) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as CustomOrder['status'] } : null);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });
      
      if (res.ok) {
        setOrders(prev => prev.map(o => 
          o._id === selectedOrder._id ? { ...o, adminNotes } : o
        ));
        setSelectedOrder(prev => prev ? { ...prev, adminNotes } : null);
        toast.success('Notes saved!');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom order request?')) return;
    
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (status === 'loading' || loading) return <BrandLoader label="Custom Orders" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
              <ArrowLeft size={18} className="md:w-5 md:h-5 text-zibara-cream" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zibara-cream uppercase tracking-wider">
                Custom Orders
              </h1>
              <p className="text-zinc-300 text-xs md:text-sm mt-1">
                {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'Manage custom order requests'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'contacted', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm capitalize ${
                filter === f
                  ? 'bg-zibara-crimson text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {f === 'all' ? 'All' : statusLabels[f] || f}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-16">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-zibara-crimson rounded-full flex items-center justify-center mb-4 md:mb-6">
              <Palette className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-zibara-cream mb-2">No Custom Orders</h3>
            <p className="text-xs md:text-sm text-zinc-400">
              {filter === 'all' 
                ? 'Custom order requests will appear here'
                : `No ${statusLabels[filter]?.toLowerCase() || filter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-zinc-800 rounded-lg shadow-md p-4 md:p-5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedOrder(order);
                  setAdminNotes(order.adminNotes || '');
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-zibara-cream text-sm md:text-base">
                        {order.firstName} {order.lastName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">
                      {order.itemType} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-300 line-clamp-1">
                      {order.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.referenceImages && order.referenceImages.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-white text-[8px]">
                          📷
                        </span>
                        <span>{order.referenceImages.length}</span>
                      </div>
                    )}
                    {order.colors.length > 0 && (
                      <div className="flex -space-x-1">
                        {order.colors.slice(0, 3).map((color, idx) => (
                          <span 
                            key={idx}
                            className="w-5 h-5 rounded-full border-2 border-white text-[8px] flex items-center justify-center bg-zibara-crimson text-white"
                            title={color}
                          >
                            {color[0]}
                          </span>
                        ))}
                        {order.colors.length > 3 && (
                          <span className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 text-[8px] flex items-center justify-center">
                            +{order.colors.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg text-zibara-cream">
                Custom Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-zinc-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Status & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                  disabled={saving}
                  className="px-3 py-2 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-zinc-800 text-zibara-cream"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={() => deleteOrder(selectedOrder._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-zinc-800/60 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                  <a href={`mailto:${selectedOrder.email}`} className="flex items-center gap-2 text-zibara-cream hover:underline">
                    <Mail size={14} /> {selectedOrder.email}
                  </a>
                  <a href={`tel:${selectedOrder.phone}`} className="flex items-center gap-2 text-zibara-cream hover:underline">
                    <Phone size={14} /> {selectedOrder.phone}
                  </a>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-zinc-500">Item Type:</span>
                    <span className="ml-2 font-medium">{selectedOrder.itemType}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Description:</span>
                    <p className="mt-1">{selectedOrder.description}</p>
                  </div>
                  {selectedOrder.colors.length > 0 && (
                    <div>
                      <span className="text-zinc-500">Colors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedOrder.colors.map((color, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedOrder.referenceImages && selectedOrder.referenceImages.length > 0 && (
                    <div>
                      <span className="text-zinc-500">Reference Images:</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {selectedOrder.referenceImages.map((imageUrl, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-zinc-700">
                            <img
                              src={imageUrl}
                              alt={`Reference ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Click on images to view full size</p>
                    </div>
                  )}
                  {selectedOrder.budget && (
                    <div>
                      <span className="text-zinc-500">Budget:</span>
                      <span className="ml-2">{selectedOrder.budget}</span>
                    </div>
                  )}
                  {selectedOrder.deadline && (
                    <div>
                      <span className="text-zinc-500">Deadline:</span>
                      <span className="ml-2">{selectedOrder.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Measurements */}
              {selectedOrder.measurements && Object.values(selectedOrder.measurements).some(v => v) && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Measurements (cm)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {selectedOrder.measurements.bust && (
                      <div className="bg-zinc-800/60 p-2 rounded">
                        <span className="text-zinc-500 text-xs">Bust</span>
                        <p className="font-medium">{selectedOrder.measurements.bust}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.waist && (
                      <div className="bg-zinc-800/60 p-2 rounded">
                        <span className="text-zinc-500 text-xs">Waist</span>
                        <p className="font-medium">{selectedOrder.measurements.waist}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.hip && (
                      <div className="bg-zinc-800/60 p-2 rounded">
                        <span className="text-zinc-500 text-xs">Hip</span>
                        <p className="font-medium">{selectedOrder.measurements.hip}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.length && (
                      <div className="bg-zinc-800/60 p-2 rounded">
                        <span className="text-zinc-500 text-xs">Length</span>
                        <p className="font-medium">{selectedOrder.measurements.length}</p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.measurements.other && (
                    <p className="text-sm mt-2 text-zinc-400">
                      Other: {selectedOrder.measurements.other}
                    </p>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              {selectedOrder.additionalNotes && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Customer Notes</h3>
                  <p className="text-sm bg-zinc-800/60 p-3 rounded">{selectedOrder.additionalNotes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={saving}
                  className="mt-2 px-4 py-2 bg-zibara-crimson text-white text-sm rounded-lg hover:bg-zibara-blood transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-zinc-500 pt-4 border-t">
                <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
