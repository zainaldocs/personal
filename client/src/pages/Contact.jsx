import React, { useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = ({ settings }) => {
  const { lang, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await api.post('/public/contact', formData);
      if (res.data.success) {
        setStatus({
          type: 'success',
          message: lang === 'id' ? 'Pesan Anda berhasil terkirim. Terima kasih!' : 'Your message has been sent. Thank you!'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'id' ? 'Gagal mengirim pesan. Silakan coba lagi.' : 'Failed to send message. Please try again.');
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
          {lang === 'id' ? 'Hubungi Saya' : 'Get in Touch'}
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {lang === 'id' ? 'Apakah Anda memiliki proyek, diskusi arsitektur, atau konsultasi teknis? Kirimkan pesan di bawah ini.' : 'Have a project, architecture discussion, or advisory inquiry? Send a message below.'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {lang === 'id' ? 'Nama Anda *' : 'Your Name *'}
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
                  {lang === 'id' ? 'Email Anda *' : 'Your Email *'}
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
                {lang === 'id' ? 'Subjek Pesan' : 'Subject'}
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={lang === 'id' ? 'Konsultasi Proyek / Pertanyaan' : 'Project Advisory Inquiry'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {lang === 'id' ? 'Pesan Anda *' : 'Message *'}
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder={lang === 'id' ? 'Tuliskan detail pesan atau proyek Anda...' : 'Write your project details or message...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? (lang === 'id' ? 'Mengirim...' : 'Sending...') : (lang === 'id' ? 'Kirim Pesan' : 'Send Message')}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
