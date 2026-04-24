'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Trash2 } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        fetchMessages();
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !msg.read;
    if (filter === 'read') return msg.read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  if (status === 'loading' || loading) return <BrandLoader label="Messages" sublabel="ZIBARASTUDIO" tone="crimson" />;

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
            <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-2">Inbox</p>
            <h1 className="font-cormorant text-4xl md:text-5xl font-light uppercase tracking-[0.15em] text-zibara-cream">
              Messages
            </h1>
            <p className="text-[11px] font-mono text-zibara-cream/65 mt-2">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `All (${messages.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'read', label: `Read (${messages.length - unreadCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'unread' | 'read')}
              className={filter === key
                ? 'px-3 py-1.5 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em]'
                : 'px-3 py-1.5 border border-zibara-cream/20 text-[10px] font-mono uppercase tracking-[0.3em] text-zibara-cream/60 hover:border-zibara-cream/40 hover:text-zibara-cream/80 transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {filteredMessages.length === 0 ? (
          <div className="border border-zibara-cream/10 p-12 text-center">
            <Mail className="w-8 h-8 mx-auto text-zibara-cream/20 mb-4" />
            <p className="text-[11px] font-mono text-zibara-cream/65 mb-2">No messages found</p>
            <p className="text-[11px] font-mono text-zibara-cream/40">Messages from customers will appear here</p>
          </div>
        ) : (
          <div className="border border-zibara-cream/10 bg-zibara-deep">
            {filteredMessages.map((msg, idx) => (
              <div
                key={msg._id}
                className={`flex items-start gap-4 py-4 px-5 cursor-pointer hover:bg-zibara-cream/2 transition-colors ${
                  idx < filteredMessages.length - 1 ? 'border-b border-zibara-cream/8' : ''
                } ${!msg.read ? 'border-l-2 border-zibara-gold/60' : ''}`}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.read) markAsRead(msg._id);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {!msg.read && (
                      <span className="w-1.5 h-1.5 bg-zibara-crimson rounded-full shrink-0"></span>
                    )}
                    <h3 className="text-zibara-cream text-[11px] font-mono uppercase tracking-[0.1em] truncate">{msg.name}</h3>
                  </div>
                  <p className="text-[9px] font-mono text-zibara-cream/55 tracking-[0.2em] mb-1.5">{msg.email}</p>
                  <p className="text-[11px] font-mono text-zibara-cream/65 line-clamp-1">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.2em]">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg._id);
                    }}
                    className="p-1.5 border border-zibara-crimson/50 text-zibara-crimson hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-zibara-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zibara-deep border border-zibara-cream/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zibara-cream/8 flex justify-between items-start">
                <div>
                  <p className="text-[9px] tracking-[0.5em] font-mono text-zibara-cream/55 uppercase mb-1">Message From</p>
                  <h2 className="font-cormorant text-2xl font-light uppercase tracking-[0.15em] text-zibara-cream">
                    {selectedMessage.name}
                  </h2>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[11px] font-mono text-zibara-cream/65 hover:text-zibara-cream transition-colors"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 border border-zibara-cream/20 hover:border-zibara-cream/45 transition-colors text-zibara-cream/70 hover:text-zibara-cream text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <p className="text-[9px] font-mono text-zibara-cream/40 tracking-[0.3em] uppercase mb-4">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
                <div className="border border-zibara-cream/10 p-5 bg-zibara-black/30">
                  <p className="text-[11px] font-mono text-zibara-cream/85 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-zibara-cream/8 flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-zibara-crimson text-zibara-cream text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-blood transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
                <button
                  onClick={() => deleteMessage(selectedMessage._id)}
                  className="flex items-center justify-center gap-2 px-5 py-2 border border-zibara-crimson/50 text-zibara-crimson text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-zibara-crimson hover:text-zibara-cream transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
