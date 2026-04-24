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

const statusBadge: Record<string, string> = {
  pending: 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-900/30 text-yellow-400 border border-yellow-700/40',
  contacted: 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-700/40',
  in_progress: 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-purple-900/30 text-purple-400 border border-purple-700/40',
  completed: 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/20 text-zibara-cream/65',
  cancelled: 'text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-zibara-cream/15 text-zibara-cream/40',
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
      if (data.success) setOrders(data.data);
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
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus as CustomOrder['status'] } : o));
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
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, adminNotes } : o));
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

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (status === 'loading' || loading) return <BrandLoader label="Custom Orders" sublabel="ZIBARASTUDIO" tone="crimson" />;

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
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Atelier</p>
            <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
              Custom Orders
            </h1>
            <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
              {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'Manage custom order requests'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'contacted', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f
                ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
                : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
              }
            >
              {f === 'all' ? 'All' : statusLabels[f] || f}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 text-[9px]">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <Palette className="w-8 h-8 mx-auto text-zibara-cream/20 mb-4" />
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-2">No Custom Orders</p>
            <p className="text-[11px] font-mono text-zibara-cream/40">
              {filter === 'all' ? 'Custom order requests will appear here' : `No ${statusLabels[filter]?.toLowerCase() || filter} orders`}
            </p>
          </div>
        ) : (
          <div className="border border-zibara-cream/10 bg-zibara-deep">
            {filteredOrders.map((order, idx) => (
              <div
                key={order._id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-zibara-cream/2 transition-colors ${
                  idx < filteredOrders.length - 1 ? 'border-b border-zibara-cream/8' : ''
                }`}
                onClick={() => {
                  setSelectedOrder(order);
                  setAdminNotes(order.adminNotes || '');
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[11px] font-mono text-zibara-cream uppercase tracking-[0.1em]">
                      {order.firstName} {order.lastName}
                    </h3>
                    <span className={statusBadge[order.status]}>{statusLabels[order.status]}</span>
                  </div>
                  <p className="text-[9px] font-mono text-zibara-cream/55 tracking-[0.3em] uppercase mb-1">
                    {order.itemType} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] font-mono text-zibara-cream/65 line-clamp-1">
                    {order.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {order.colors.length > 0 && (
                    <div className="flex -space-x-1">
                      {order.colors.slice(0, 3).map((color, colorIdx) => (
                        <span
                          key={colorIdx}
                          className="w-4 h-4 border border-zibara-cream/20 flex items-center justify-center bg-zibara-crimson text-[7px] font-mono text-white"
                          title={color}
                        >
                          {color[0]}
                        </span>
                      ))}
                      {order.colors.length > 3 && (
                        <span className="w-4 h-4 border border-zibara-cream/20 bg-zibara-deep text-[7px] font-mono text-zibara-cream/60 flex items-center justify-center">
                          +{order.colors.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-zibara-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zibara-deep border border-zibara-cream/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-zibara-deep border-b border-zibara-cream/8 p-6 flex items-start justify-between">
              <div>
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">Custom Order</p>
                <h2 className="font-cormorant text-2xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                  {selectedOrder.firstName} {selectedOrder.lastName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream text-lg leading-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status & Delete */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                  disabled={saving}
                  className="px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={() => deleteOrder(selectedOrder._id)}
                  className="p-2 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Customer Info */}
              <div className="border border-zibara-cream/8 p-4">
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Customer Information</p>
                <div className="space-y-1.5 text-[11px] font-mono text-zibara-cream/80">
                  <p className="text-zibara-cream">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                  <a href={`mailto:${selectedOrder.email}`} className="flex items-center gap-2 hover:text-zibara-cream transition-colors">
                    <Mail size={12} className="text-zibara-cream/40" /> {selectedOrder.email}
                  </a>
                  <a href={`tel:${selectedOrder.phone}`} className="flex items-center gap-2 hover:text-zibara-cream transition-colors">
                    <Phone size={12} className="text-zibara-cream/40" /> {selectedOrder.phone}
                  </a>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Order Details</p>
                <div className="space-y-3 text-[11px] font-mono">
                  <div className="flex gap-2">
                    <span className="text-zibara-cream/55 shrink-0">Item Type:</span>
                    <span className="text-zibara-cream/85">{selectedOrder.itemType}</span>
                  </div>
                  <div>
                    <span className="text-zibara-cream/55">Description:</span>
                    <p className="mt-1 text-zibara-cream/80 leading-relaxed">{selectedOrder.description}</p>
                  </div>
                  {selectedOrder.colors.length > 0 && (
                    <div>
                      <span className="text-zibara-cream/55">Colors:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedOrder.colors.map((color, idx) => (
                          <span key={idx} className="px-2 py-0.5 border border-zibara-cream/15 text-[9px] font-mono uppercase tracking-[0.2em] text-zibara-cream/65">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedOrder.referenceImages && selectedOrder.referenceImages.length > 0 && (
                    <div>
                      <span className="text-zibara-cream/55">Reference Images:</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {selectedOrder.referenceImages.map((imageUrl, idx) => (
                          <div key={idx} className="relative aspect-square overflow-hidden border border-zibara-cream/10">
                            <img
                              src={imageUrl}
                              alt={`Reference ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.2em] mt-1">Click to view full size</p>
                    </div>
                  )}
                  {selectedOrder.budget && (
                    <div className="flex gap-2">
                      <span className="text-zibara-cream/55">Budget:</span>
                      <span className="text-zibara-cream/80">{selectedOrder.budget}</span>
                    </div>
                  )}
                  {selectedOrder.deadline && (
                    <div className="flex gap-2">
                      <span className="text-zibara-cream/55">Deadline:</span>
                      <span className="text-zibara-cream/80">{selectedOrder.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Measurements */}
              {selectedOrder.measurements && Object.values(selectedOrder.measurements).some(v => v) && (
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Measurements (cm)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedOrder.measurements.bust && (
                      <div className="border border-zibara-cream/8 p-3">
                        <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-1">Bust</p>
                        <p className="text-[11px] font-mono text-zibara-cream">{selectedOrder.measurements.bust}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.waist && (
                      <div className="border border-zibara-cream/8 p-3">
                        <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-1">Waist</p>
                        <p className="text-[11px] font-mono text-zibara-cream">{selectedOrder.measurements.waist}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.hip && (
                      <div className="border border-zibara-cream/8 p-3">
                        <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-1">Hip</p>
                        <p className="text-[11px] font-mono text-zibara-cream">{selectedOrder.measurements.hip}</p>
                      </div>
                    )}
                    {selectedOrder.measurements.length && (
                      <div className="border border-zibara-cream/8 p-3">
                        <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-1">Length</p>
                        <p className="text-[11px] font-mono text-zibara-cream">{selectedOrder.measurements.length}</p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.measurements.other && (
                    <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
                      Other: {selectedOrder.measurements.other}
                    </p>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              {selectedOrder.additionalNotes && (
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Customer Notes</p>
                  <p className="text-[11px] font-mono text-zibara-cream/75 border border-zibara-cream/8 p-4 leading-relaxed">{selectedOrder.additionalNotes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-3">Admin Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this order..."
                  className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-zibara-gold/50 resize-none"
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={saving}
                  className="mt-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Timestamps */}
              <div className="text-[9px] font-mono text-zibara-cream/35 tracking-[0.2em] pt-4 border-t border-zibara-cream/8 space-y-1">
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
