import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Save, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    hero_status: { id: '', en: '' },
    hero_title: { id: '', en: '' },
    hero_desc: { id: '', en: '' },
    contact_email: { id: '', en: '' },
    social_github: { id: '', en: '' },
    social_twitter: { id: '', en: '' },
    social_linkedin: { id: '', en: '' }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success && res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key, lang, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.put('/admin/settings', { settings });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-zinc-500 py-4">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Pengaturan Situs</h1>
          <p className="text-sm text-zinc-500">Ubah teks banner, judul hero, biografi, dan tautan sosial media.</p>
        </div>
        {savedSuccess && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Status */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Banner Status Ketersediaan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Bahasa Indonesia</label>
              <input
                type="text"
                value={settings.hero_status?.id || ''}
                onChange={(e) => handleChange('hero_status', 'id', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">English</label>
              <input
                type="text"
                value={settings.hero_status?.en || ''}
                onChange={(e) => handleChange('hero_status', 'en', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Hero Title & Desc */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Judul & Biografi Beranda</h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Judul Hero (ID)</label>
                <textarea
                  rows={2}
                  value={settings.hero_title?.id || ''}
                  onChange={(e) => handleChange('hero_title', 'id', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Hero Title (EN)</label>
                <textarea
                  rows={2}
                  value={settings.hero_title?.en || ''}
                  onChange={(e) => handleChange('hero_title', 'en', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Biografi Singkat (ID)</label>
                <textarea
                  rows={3}
                  value={settings.hero_desc?.id || ''}
                  onChange={(e) => handleChange('hero_desc', 'id', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Short Bio (EN)</label>
                <textarea
                  rows={3}
                  value={settings.hero_desc?.en || ''}
                  onChange={(e) => handleChange('hero_desc', 'en', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Email & Socials */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email & Tautan Sosial Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Kontak</label>
              <input
                type="email"
                value={settings.contact_email?.id || ''}
                onChange={(e) => {
                  handleChange('contact_email', 'id', e.target.value);
                  handleChange('contact_email', 'en', e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL GitHub</label>
              <input
                type="url"
                value={settings.social_github?.id || ''}
                onChange={(e) => {
                  handleChange('social_github', 'id', e.target.value);
                  handleChange('social_github', 'en', e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL Twitter / X</label>
              <input
                type="url"
                value={settings.social_twitter?.id || ''}
                onChange={(e) => {
                  handleChange('social_twitter', 'id', e.target.value);
                  handleChange('social_twitter', 'en', e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL LinkedIn</label>
              <input
                type="url"
                value={settings.social_linkedin?.id || ''}
                onChange={(e) => {
                  handleChange('social_linkedin', 'id', e.target.value);
                  handleChange('social_linkedin', 'en', e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
