import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('id'); // 'id' | 'en'

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    content_id: '',
    content_en: '',
    excerpt_id: '',
    excerpt_en: '',
    category: 'Architecture',
    read_time: '5 min baca',
    is_published: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/posts');
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title_id: '',
      title_en: '',
      content_id: '',
      content_en: '',
      excerpt_id: '',
      excerpt_en: '',
      category: 'Architecture',
      read_time: '5 min baca',
      is_published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      title_id: post.title_id,
      title_en: post.title_en,
      content_id: post.content_id,
      content_en: post.content_en,
      excerpt_id: post.excerpt_id || '',
      excerpt_en: post.excerpt_en || '',
      category: post.category,
      read_time: post.read_time,
      is_published: !!post.is_published
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert('Gagal menghapus artikel.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/posts/${editingId}`, formData);
      } else {
        await api.post('/admin/posts', formData);
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan artikel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Kelola Blog & Artikel</h1>
          <p className="text-sm text-zinc-500">Tambah, edit, atau hapus artikel blog bilingual.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Artikel Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500 py-4">Loading articles...</div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Judul Artikel (ID / EN)</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-4">
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{p.title_id}</div>
                    <div className="text-zinc-400 italic">{p.title_en}</div>
                  </td>
                  <td className="p-4 font-mono">{p.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      p.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{new Date(p.published_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-subtle rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-display">{editingId ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h2>

            {/* Bilingual Tab Switcher */}
            <div className="flex border-b border-subtle">
              <button
                type="button"
                onClick={() => setActiveTab('id')}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === 'id' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                }`}
              >
                🇮🇩 Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === 'en' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'id' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Judul (Bahasa Indonesia) *</label>
                    <input
                      type="text"
                      required
                      value={formData.title_id}
                      onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Ringkasan Excerpt (Bahasa Indonesia)</label>
                    <textarea
                      rows={2}
                      value={formData.excerpt_id}
                      onChange={(e) => setFormData({ ...formData, excerpt_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Isi Artikel HTML/Text (Bahasa Indonesia) *</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.content_id}
                      onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Excerpt (English)</label>
                    <textarea
                      rows={2}
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Article Content HTML/Text (English) *</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.content_en}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Kategori *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Estimasi Waktu Baca</label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_published" className="text-xs font-semibold">Publikasikan Artikel Langsung (Published)</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-subtle text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
