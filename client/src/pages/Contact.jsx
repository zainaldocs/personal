import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, CheckCircle, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';

const Contact = ({ settings }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_url: ''
  });

  // Interactive Math Captcha Challenge State
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer('');
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setCaptchaError(false);

    // Verify Captcha Challenge
    if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
      setCaptchaError(true);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/public/contact', formData);
      if (res.data.success) {
        setStatus({
          type: 'success',
          message: 'Pesan Anda berhasil terkirim. Terima kasih telah menghubungi!'
        });
        setFormData({ name: '', email: '', subject: '', message: '', website_url: '' });
        generateCaptcha();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
          Hubungi Saya
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Apakah Anda memiliki proyek, diskusi arsitektur sistem terdistribusi, atau konsultasi teknis? Kirimkan pesan di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-subtle">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              <Mail className="w-4 h-4 text-emerald-500" />
              <span>Direct Email</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              {t(settings?.contact_email) || 'teguh@example.com'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Keamanan Anti-Spam</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Dilindungi oleh Captcha Verifikasi Manusia, Honeypot Anti-Bot, Enkripsi SSL, dan Rate Limiter IP.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {status && (
            <div className={`p-4 mb-6 rounded-xl border flex items-center space-x-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invisible Honeypot Field */}
            <input
              type="text"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Anda *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Subjek Pesan
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Konsultasi Proyek / Pertanyaan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Pesan Anda *
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tuliskan detail pesan atau proyek Anda..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
              />
            </div>

            {/* Interactive Visual Captcha Challenge Box */}
            <div className="p-4 rounded-xl border border-subtle bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verifikasi Keamanan Captcha *</span>
                </label>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center space-x-1"
                  title="Ganti Soal Captcha"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Soal</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="px-3.5 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm tracking-wider select-none">
                  Berapa {captchaNum1} + {captchaNum2} = ?
                </div>
                <input
                  type="number"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Jawaban angka"
                  className="w-32 px-3 py-2 rounded-lg border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none"
                />
              </div>

              {captchaError && (
                <p className="text-xs text-rose-500 font-semibold pt-1">
                  Jawaban Captcha tidak tepat. Silakan coba hitung kembali.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Mengirim Pesan...' : 'Kirim Pesan'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
