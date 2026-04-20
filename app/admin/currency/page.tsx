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
      if (data.success) {
        setRates(data.rates);
      }
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
      const response = await fetch(`/api/admin/currency?id=${id}`, {
        method: 'DELETE',
      });

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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EBB0C9] scroll-mt-32 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/admin"
              className="p-2 bg-[#f5d5e5] rounded-lg hover:bg-[#d896b5]/30 transition-colors shrink-0"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5 text-[#8b2b4d]" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[#8b2b4d]">
              Currency Management
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-[#8b2b4d] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#6d1f3a] transition-colors text-sm md:text-base shrink-0"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            Add Currency
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 flex-1">
          {/* Add New Currency Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-[#f5d5e5] rounded-lg border border-[#8b2b4d]/20">
              <h2 className="text-lg font-semibold text-[#8b2b4d] mb-4">Add New Currency</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b2b4d] mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg focus:outline-none focus:border-[#8b2b4d]"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b2b4d] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                    placeholder="US Dollar"
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg focus:outline-none focus:border-[#8b2b4d]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b2b4d] mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    placeholder="$"
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg focus:outline-none focus:border-[#8b2b4d]"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b2b4d] mb-1">
                    Rate (to USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCurrency.rate}
                    onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) || 0 })}
                    placeholder="1.00"
                    className="w-full px-3 py-2 border border-[#8b2b4d]/20 rounded-lg focus:outline-none focus:border-[#8b2b4d]"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#8b2b4d] text-white px-4 py-2 rounded-lg hover:bg-[#6d1f3a] transition-colors"
                  >
                    <Save size={18} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCurrency({ code: '', name: '', symbol: '', rate: 1, isActive: true });
                    }}
                    className="px-4 py-2 border border-[#8b2b4d]/20 rounded-lg hover:bg-[#8b2b4d]/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Currency Rates Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#8b2b4d]/20">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Symbol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Rate (to USD)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#8b2b4d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate._id || rate.code} className="border-b border-[#8b2b4d]/10">
                    {editingId === rate._id ? (
                      <>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.code}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, code: e.target.value.toUpperCase() } : r))}
                            className="w-full px-2 py-1 border border-[#8b2b4d]/20 rounded focus:outline-none focus:border-[#8b2b4d]"
                            maxLength={3}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.name}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, name: e.target.value } : r))}
                            className="w-full px-2 py-1 border border-[#8b2b4d]/20 rounded focus:outline-none focus:border-[#8b2b4d]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={rate.symbol}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, symbol: e.target.value } : r))}
                            className="w-full px-2 py-1 border border-[#8b2b4d]/20 rounded focus:outline-none focus:border-[#8b2b4d]"
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
                            className="w-full px-2 py-1 border border-[#8b2b4d]/20 rounded focus:outline-none focus:border-[#8b2b4d]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={rate.isActive ? 'active' : 'inactive'}
                            onChange={(e) => setRates(rates.map(r => r._id === rate._id ? { ...r, isActive: e.target.value === 'active' } : r))}
                            className="w-full px-2 py-1 border border-[#8b2b4d]/20 rounded focus:outline-none focus:ring-2 focus:ring-[#8b2b4d] focus:border-transparent bg-[#f5d5e5] text-[#8b2b4d]"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(rate)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                fetchRates();
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-sm font-medium">{rate.code}</td>
                        <td className="py-3 px-4 text-sm">{rate.name}</td>
                        <td className="py-3 px-4 text-sm">{rate.symbol}</td>
                        <td className="py-3 px-4 text-sm">{rate.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(rate._id || null)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            {rate.code !== 'USD' && (
                              <button
                                onClick={() => rate._id && handleDelete(rate._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={18} />
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
            <div className="text-center py-12 text-[#8b2b4d]/60">
              <p>No currency rates found. Add your first currency above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
