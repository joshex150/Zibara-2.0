'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';
import toast from 'react-hot-toast';

interface CurrencyRate {
  _id?: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isActive: boolean;
}

export default function CurrencyManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState<CurrencyRate>({
    code: '',
    name: '',
    symbol: '',
    rate: 1,
    isActive: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchRates();
    }
  }, [status, router]);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/currency');
      const data = await response.json();
      if (data.success) setRates(data.rates);
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      toast.error('Failed to fetch currency rates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (rate: CurrencyRate) => {
    try {
      const response = await fetch('/api/admin/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rate),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Currency rate saved successfully');
        setEditingId(null);
        fetchRates();
      } else {
        toast.error(data.error || 'Failed to save currency rate');
      }
    } catch (error) {
      console.error('Error saving currency rate:', error);
      toast.error('Failed to save currency rate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this currency?')) return;
    try {
      const response = await fetch(`/api/admin/currency?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Currency deleted successfully');
        fetchRates();
      } else {
        toast.error(data.error || 'Failed to delete currency');
      }
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error('Failed to delete currency');
    }
  };

  const handleAdd = async () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast.error('Please fill in all required fields');
      return;
    }
    await handleSave(newCurrency);
    setNewCurrency({ code: '', name: '', symbol: '', rate: 1, isActive: true });
    setShowAddForm(false);
  };

  if (status === 'loading' || loading) return <BrandLoader label="Currency" sublabel="ZIBARASTUDIO" tone="crimson" />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zibara-black text-zibara-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-zibara-cream/5 pb-8 mb-10">
          <div className="flex items-start gap-4">
            <Link
              href="/admin"
              className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream shrink-0 mt-1"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Finance</p>
              <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                Currency
              </h1>
              <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">Manage exchange rates</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors shrink-0"
          >
            <Plus size={14} />
            Add Currency
          </button>
        </div>

        <div className="border border-zibara-cream/10 bg-zibara-deep p-5 md:p-8">
          {/* Add New Currency Form */}
          {showAddForm && (
            <div className="mb-8 p-5 border border-zibara-cream/8 bg-zibara-black/20">
              <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-4">Add New Currency</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Code *</label>
                  <input
                    type="text"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                    placeholder="US Dollar"
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Symbol *</label>
                  <input
                    type="text"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    placeholder="$"
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.35em] text-zibara-cream/55 mb-2">Rate (to USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCurrency.rate}
                    onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) || 0 })}
                    placeholder="1.00"
                    className="w-full px-3 py-2 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
                  >
                    <Save size={12} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCurrency({ code: '', name: '', symbol: '', rate: 1, isActive: true });
                    }}
                    className="p-2 border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Currency Rates Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zibara-cream/8">
                  <th className="text-left py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Code</th>
                  <th className="text-left py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Name</th>
                  <th className="text-left py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Symbol</th>
                  <th className="text-left py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Rate (to USD)</th>
                  <th className="text-left py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Status</th>
                  <th className="text-right py-3 px-4 text-[9px] font-mono uppercase tracking-[0.4em] text-zibara-cream/55">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate._id || rate.code} className="border-b border-zibara-cream/5">
                    {editingId === rate._id ? (
                      <>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.code}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, code: e.target.value.toUpperCase() } : r))}
                            className="w-full px-2 py-1 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50"
                            maxLength={3}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.name}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, name: e.target.value } : r))}
                            className="w-full px-2 py-1 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.symbol}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, symbol: e.target.value } : r))}
                            className="w-full px-2 py-1 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50"
                            maxLength={5}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={rate.rate}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, rate: parseFloat(e.target.value) || 0 } : r))}
                            className="w-full px-2 py-1 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-1 focus:ring-zibara-gold/50"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={rate.isActive ? 'active' : 'inactive'}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, isActive: e.target.value === 'active' } : r))}
                            className="w-full px-2 py-1 border border-zibara-cream/35 bg-zibara-black/40 text-zibara-cream text-sm focus:outline-none focus:ring-2 focus:ring-zibara-gold/50"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(rate)}
                              className="p-2 bg-zibara-crimson text-zibara-cream hover:bg-zibara-blood transition-colors"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => { setEditingId(null); fetchRates(); }}
                              className="p-2 border border-zibara-cream/25 text-zibara-cream/65 hover:border-zibara-cream/50 hover:text-zibara-cream transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-[10px] font-mono uppercase tracking-[0.2em] text-zibara-cream">{rate.code}</td>
                        <td className="py-3 px-4 text-[11px] font-mono text-zibara-cream/80">{rate.name}</td>
                        <td className="py-3 px-4 text-[11px] font-mono text-zibara-cream/80">{rate.symbol}</td>
                        <td className="py-3 px-4 text-[11px] font-mono text-zibara-cream/80">
                          {rate.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 ${
                            rate.isActive
                              ? 'border border-zibara-cream/20 text-zibara-cream/65'
                              : 'border border-zibara-cream/10 text-zibara-cream/35'
                          }`}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(rate._id || null)}
                              className="p-2 border border-zibara-cream/20 text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            {rate.code !== 'USD' && (
                              <button
                                onClick={() => rate._id && handleDelete(rate._id)}
                                className="p-2 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[11px] font-mono text-zibara-cream/40">No currency rates found. Add your first currency above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
