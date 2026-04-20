'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Trash2, Check, MailOpen } from 'lucide-react';
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
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });

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
              Messages
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'View customer messages'}
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
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'unread'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm ${
              filter === 'read'
                ? 'bg-zibara-crimson text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>

        {/* Messages */}
        {filteredMessages.length === 0 ? (
          <div className="bg-zibara-crimson rounded-lg p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
            <Mail className="w-10 h-10 md:w-12 md:h-12 mx-auto text-white/60 mb-3 md:mb-4" />
            <p className="text-base md:text-lg text-white mb-3 md:mb-4">No messages found</p>
            <p className="text-xs md:text-sm text-white/80">Messages from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredMessages.map((msg) => (
              <div 
                key={msg._id} 
                className={`bg-zinc-800 rounded-lg shadow-md p-4 md:p-5 cursor-pointer hover:shadow-lg transition-shadow ${
                  !msg.read ? 'border-l-4 border-zinc-600' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.read) markAsRead(msg._id);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.read && (
                        <span className="w-2 h-2 bg-zibara-crimson rounded-full shrink-0"></span>
                      )}
                      <h3 className="font-bold text-zinc-100 text-sm md:text-base truncate">{msg.name}</h3>
                    </div>
                    <p className="text-[10px] md:text-xs text-zinc-400 mb-2">{msg.email}</p>
                    <p className="text-xs md:text-sm text-gray-800 line-clamp-2">{msg.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] md:text-xs text-zinc-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg._id);
                      }}
                      className="p-1.5 bg-zibara-crimson text-white rounded hover:bg-zibara-blood transition-colors"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-zinc-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-1">
                      {selectedMessage.name}
                    </h2>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-xs md:text-sm text-zibara-cream hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-zinc-500 hover:text-zinc-400 text-xl md:text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <p className="text-[10px] md:text-xs text-zinc-500 mb-3">
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
                <div className="bg-white rounded-lg p-4 md:p-5">
                  <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-zinc-700 flex flex-col sm:flex-row gap-2 md:gap-3">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-zibara-crimson text-white py-2.5 rounded-lg text-xs md:text-sm font-semibold hover:bg-zibara-blood transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
                <button
                  onClick={() => {
                    deleteMessage(selectedMessage._id);
                  }}
                  className="flex items-center justify-center gap-2 bg-gray-200 text-zinc-300 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
