import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Mail, Check, Trash2, MailOpen } from 'lucide-react';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/messages');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      fetchMessages();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesan ini?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      alert('Gagal menghapus pesan.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Pesan Masuk (Inbox)</h1>
        <p className="text-sm text-zinc-500">Kelola pesan dan pertanyaan dari formulir kontak publik.</p>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500 py-4">Loading inbox...</div>
      ) : messages.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-500 border border-subtle rounded-2xl bg-white dark:bg-zinc-900">
          Belum ada pesan masuk.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="md:col-span-1 border border-subtle rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-subtle max-h-[70vh] overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMessage(m);
                  if (!m.is_read) handleMarkAsRead(m.id);
                }}
                className={`p-4 cursor-pointer transition-colors space-y-1 ${
                  selectedMessage?.id === m.id
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : m.is_read
                    ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 opacity-70'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold truncate text-zinc-900 dark:text-zinc-100">{m.name}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{m.subject || 'Pertanyaan Umum'}</div>
              </div>
            ))}
          </div>

          {/* Message Content Detail */}
          <div className="md:col-span-2 border border-subtle rounded-2xl bg-white dark:bg-zinc-900 p-6 space-y-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-subtle">
                  <div>
                    <h2 className="text-lg font-bold font-display">{selectedMessage.subject || 'Pertanyaan Umum'}</h2>
                    <div className="text-xs text-zinc-500 mt-1">
                      Dari: <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedMessage.name}</span> (&lt;{selectedMessage.email}&gt;)
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(selectedMessage.id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {selectedMessage.message}
                </div>

                <div className="pt-4 border-t border-subtle">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Pertanyaan')}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition-opacity"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Balas Via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-zinc-400 font-mono">
                Pilih pesan di sebelah kiri untuk membaca detail.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInbox;
