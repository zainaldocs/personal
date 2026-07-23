import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'System',
    tags: 'Rust, Distributed Systems',
    project_url: '',
    github_url: '',
    is_featured: false,
    sort_order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'System',
      tags: 'Rust, CLI',
      project_url: '',
      github_url: '',
      is_featured: false,
      sort_order: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingId(proj.id);
    setFormData({
      title: proj.title,
      description: proj.description_id || proj.description_en,
      category: proj.category,
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags,
      project_url: proj.project_url || '',
      github_url: proj.github_url || '',
      is_featured: !!proj.is_featured,
      sort_order: proj.sort_order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus proyek ini?')) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Gagal menghapus proyek.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: formData.title,
      description_id: formData.description,
      description_en: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      project_url: formData.project_url,
      github_url: formData.github_url,
      is_featured: formData.is_featured,
      sort_order: formData.sort_order
    };

    try {
      if (editingId) {
        await api.put(`/admin/projects/${editingId}`, payload);
      } else {
        await api.post('/admin/projects', payload);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan proyek.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Kelola Portofolio Proyek</h1>
          <p className="text-sm text-zinc-500">Tambah dan kelola karya atau proyek showcase.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500 py-4">Memuat proyek...</div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/80 dark:bg-zinc-800/40 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4">Nama Proyek</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Tags Teknologi</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-4 font-bold text-sm text-zinc-900 dark:text-zinc-100">{p.title}</td>
                  <td className="p-4 font-mono">{p.category}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(p.tags) && p.tags.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {p.is_featured ? (
                      <span className="inline-flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>Featured</span>
                      </span>
                    ) : '-'}
                  </td>
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
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-subtle rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-display">{editingId ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Nama Proyek *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Deskripsi Proyek *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuliskan deskripsi singkat mengenai proyek ini..."
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
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
                  <label className="text-xs font-semibold">Tags Teknologi (Dipisah koma) *</label>
                  <input
                    type="text"
                    required
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Rust, TypeScript, React"
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">URL Demo / Live App</label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">URL Repositori GitHub</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_featured" className="text-xs font-semibold">Tampilkan di Karya Pilihan Beranda (Featured)</label>
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
                  {submitting ? 'Menyimpan...' : 'Simpan Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
