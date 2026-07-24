import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import RichTextEditor from '../components/RichTextEditor';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
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
      title: '',
      content: '<p>Tuliskan artikel blog Anda di sini...</p>',
      excerpt: '',
      category: 'Architecture',
      read_time: '5 min baca',
      is_published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (post) => {
    try {
      const res = await api.get(`/admin/posts/${post.id}`);
      if (res.data.success) {
        const fullPost = res.data.data;
        setEditingId(fullPost.id);
        setFormData({
          title: fullPost.title_id || fullPost.title_en,
          content: fullPost.content_id || fullPost.content_en || '',
          excerpt: fullPost.excerpt_id || fullPost.excerpt_en || '',
          category: fullPost.category,
          read_time: fullPost.read_time,
          is_published: !!fullPost.is_published
        });
        setIsModalOpen(true);
      }
    } catch(err) {
      alert('Gagal mengambil data lengkap artikel.');
    }
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

    const payload = {
      title_id: formData.title,
      title_en: formData.title,
      content_id: formData.content,
      content_en: formData.content,
      excerpt_id: formData.excerpt,
      excerpt_en: formData.excerpt,
      category: formData.category,
      read_time: formData.read_time,
      is_published: formData.is_published
    };

    try {
      if (editingId) {
        await api.put(`/admin/posts/${editingId}`, payload);
      } else {
        await api.post('/admin/posts', payload);
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
          <p className="text-sm text-zinc-500">Tambah, edit, atau hapus artikel blog dengan TipTap Rich Text Editor.</p>
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
        <div className="text-sm font-mono text-zinc-500 py-4">Memuat artikel...</div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/80 dark:bg-zinc-800/40 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4">Judul Artikel</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-4 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {p.title_id || p.title_en}
                  </td>
                  <td className="p-4 font-mono">{p.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      p.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{new Date(p.published_at).toLocaleDateString('id-ID')}</td>
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
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-subtle rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-display">{editingId ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Judul artikel blog..."
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Ringkasan Excerpt</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Ringkasan singkat artikel..."
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>

              {/* TipTap Rich Text Editor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold">Isi Konten Artikel (TipTap Rich Text Editor) *</label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                />
              </div>

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
