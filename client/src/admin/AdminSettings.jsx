import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Save, CheckCircle, Mail, Send, AlertCircle, Layout } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_title: 'zainal.co',
    site_owner_name: 'Zainal Abidin',
    hero_status: '',
    hero_title: '',
    hero_desc: '',
    contact_email: '',
    social_github: '',
    social_twitter: '',
    social_linkedin: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    notification_email: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success && res.data.data) {
          const raw = res.data.data;
          setSettings({
            site_title: raw.site_title?.id || raw.site_title?.en || 'zainal.co',
            site_owner_name: raw.site_owner_name?.id || raw.site_owner_name?.en || 'Zainal Abidin',
            hero_status: raw.hero_status?.id || raw.hero_status?.en || '',
            hero_title: raw.hero_title?.id || raw.hero_title?.en || '',
            hero_desc: raw.hero_desc?.id || raw.hero_desc?.en || '',
            contact_email: raw.contact_email?.id || raw.contact_email?.en || '',
            social_github: raw.social_github?.id || raw.social_github?.en || '',
            social_twitter: raw.social_twitter?.id || raw.social_twitter?.en || '',
            social_linkedin: raw.social_linkedin?.id || raw.social_linkedin?.en || '',
            smtp_host: raw.smtp_host?.id || '',
            smtp_port: raw.smtp_port?.id || '587',
            smtp_user: raw.smtp_user?.id || '',
            smtp_pass: raw.smtp_pass?.id || '',
            notification_email: raw.notification_email?.id || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const formattedPayload = {};
    Object.keys(settings).forEach(k => {
      formattedPayload[k] = {
        id: settings[k],
        en: settings[k]
      };
    });

    try {
      await api.put('/admin/settings', { settings: formattedPayload });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpStatus(null);

    const formattedPayload = {};
    Object.keys(settings).forEach(k => {
      formattedPayload[k] = { id: settings[k], en: settings[k] };
    });

    try {
      await api.put('/admin/settings', { settings: formattedPayload });
      const res = await api.post('/admin/settings/test-smtp');
      if (res.data.success) {
        setSmtpStatus({ type: 'success', message: res.data.message });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim email tes. Periksa kembali host, user, dan password SMTP Anda.';
      setSmtpStatus({ type: 'error', message: msg });
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-zinc-500 py-4">Memuat pengaturan...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Pengaturan Situs & Brand</h1>
          <p className="text-sm text-zinc-500">Kelola nama logo/brand website, biografi, tautan sosial media, dan server SMTP pengirim notifikasi email.</p>
        </div>
        {savedSuccess && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Identity Settings (DYNAMIC BRAND LOGO) */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex items-center space-x-2">
            <Layout className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Identitas & Brand Logo Website (Dinamis)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Nama Brand / Logo Website (Navbar & Header) *</label>
              <input
                type="text"
                required
                value={settings.site_title}
                onChange={(e) => handleChange('site_title', e.target.value)}
                placeholder="zainal.co / personal.dev"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-bold font-display"
              />
              <span className="text-[11px] text-zinc-400">Tampil di pojok kiri Navbar & Header Admin.</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Nama Lengkap Pemilik Website *</label>
              <input
                type="text"
                required
                value={settings.site_owner_name}
                onChange={(e) => handleChange('site_owner_name', e.target.value)}
                placeholder="Zainal Abidin"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
              <span className="text-[11px] text-zinc-400">Tampil di Footer & Hak Cipta Website.</span>
            </div>
          </div>
        </div>

        {/* Banner Status */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Banner Status Ketersediaan</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Teks Status Banner</label>
            <input
              type="text"
              value={settings.hero_status}
              onChange={(e) => handleChange('hero_status', e.target.value)}
              placeholder="Tersedia untuk Konsultasi & Proyek Q3/Q4"
              className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
            />
          </div>
        </div>

        {/* Hero Title & Desc */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Judul & Biografi Beranda</h2>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Judul Utama Hero</label>
              <textarea
                rows={2}
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Biografi Singkat</label>
              <textarea
                rows={3}
                value={settings.hero_desc}
                onChange={(e) => handleChange('hero_desc', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Contact Email & Socials */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email & Tautan Sosial Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email Kontak Publik</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL GitHub</label>
              <input
                type="url"
                value={settings.social_github}
                onChange={(e) => handleChange('social_github', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL Twitter / X</label>
              <input
                type="url"
                value={settings.social_twitter}
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">URL LinkedIn</label>
              <input
                type="url"
                value={settings.social_linkedin}
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* SMTP Mailer Configuration */}
        <div className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Pengaturan Server SMTP Email Notifikasi</h2>
          </div>
          <p className="text-xs text-zinc-500">
            Server ini mengirimkan notifikasi email otomatis ke inbox Anda saat pengunjung mengisi form kontak. Anda bisa menggunakan SMTP Gmail (App Password), Brevo, Mailtrap, atau cPanel Mail.
          </p>

          {smtpStatus && (
            <div className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
              smtpStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {smtpStatus.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{smtpStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">SMTP Host *</label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com atau smtp.brevo.com"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">SMTP Port *</label>
              <input
                type="text"
                value={settings.smtp_port}
                onChange={(e) => handleChange('smtp_port', e.target.value)}
                placeholder="587 atau 465"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">SMTP Username / Email *</label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="emailpengirim@gmail.com"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">SMTP Password / App Password *</label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => handleChange('smtp_pass', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold">Email Penerima Notifikasi (Inbox Anda) *</label>
              <input
                type="email"
                value={settings.notification_email}
                onChange={(e) => handleChange('notification_email', e.target.value)}
                placeholder="emailpribadianda@gmail.com"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="px-4 py-2 rounded-xl border border-subtle bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingSmtp ? 'Mengirim Tes Email...' : '🧪 Simpan & Kirim Tes Email Notifikasi'}</span>
            </button>
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
