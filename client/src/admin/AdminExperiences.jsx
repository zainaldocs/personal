import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('id');

  const [formData, setFormData] = useState({
    role_id: '',
    role_en: '',
    company: '',
    period: '',
    description_id: '',
    description_en: '',
    sort_order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/experiences');
      if (res.data.success) {
        setExperiences(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch experiences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      role_id: '',
      role_en: '',
      company: '',
      period: '2024 — Sekarang',
      description_id: '',
      description_en: '',
      sort_order: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingId(exp.id);
    setFormData({
      role_id: exp.role_id,
      role_en: exp.role_en,
      company: exp.company,
      period: exp.period,
      description_id: exp.description_id || '',
      description_en: exp.description_en || '',
      sort_order: exp.sort_order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus riwayat pengalaman ini?')) return;
    try {
      await api.delete(`/admin/experiences/${id}`);
      fetchExperiences();
    } catch (err) {
      alert('Gagal menghapus pengalaman.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/experiences/${editingId}`, formData);
      } else {
        await api.post('/admin/experiences', formData);
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengalaman.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Kelola Riwayat Pengalaman</h1>
          <p className="text-sm text-zinc-500">Tambah dan kelola timeline karir pada halaman Tentang.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengalaman Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500 py-4">Loading timeline...</div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Peran / Jabatan (ID / EN)</th>
                <th className="p-4">Perusahaan</th>
                <th className="p-4">Periode</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {experiences.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-4 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    <div>{e.role_id}</div>
                    <div className="text-zinc-400 font-normal italic">{e.role_en}</div>
                  </td>
                  <td className="p-4 font-semibold">{e.company}</td>
                  <td className="p-4 font-mono text-zinc-400">{e.period}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(e)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-subtle rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-display">{editingId ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Periode *</label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="2024 — Sekarang"
                    className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Bilingual Tab Switcher */}
              <div className="flex border-b border-subtle">
                <button
                  type="button"
                  onClick={() => setActiveTab('id')}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${
                    activeTab === 'id' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  🇮🇩 Indonesia
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

              {activeTab === 'id' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Jabatan/Peran (ID) *</label>
                    <input
                      type="text"
                      required
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Deskripsi Tugas (ID)</label>
                    <textarea
                      rows={3}
                      value={formData.description_id}
                      onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Role/Title (EN) *</label>
                    <input
                      type="text"
                      required
                      value={formData.role_en}
                      onChange={(e) => setFormData({ ...formData, role_en: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Description (EN)</label>
                    <textarea
                      rows={3}
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                    />
                  </div>
                </>
              )}

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
                  {submitting ? 'Menyimpan...' : 'Simpan Pengalaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperiences;
