import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Lock, Mail, AlertCircle, ArrowLeft, Moon, Sun, HelpCircle } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = googleClientId && !googleClientId.includes('placeholder');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Login gagal.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login Hook with explicit Account Chooser Prompt
  const handleCustomGoogleLogin = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/auth/google', {
          access_token: tokenResponse.access_token
        });

        if (res.data.success && res.data.data.token) {
          localStorage.setItem('admin_token', res.data.data.token);
          window.location.href = '/admin/dashboard';
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login via Google gagal. Pastikan akun Google yang Anda pilih terdaftar sebagai admin.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Gagal menghubungkan dengan Google Auth.');
    }
  });

  const onGoogleButtonClick = () => {
    if (!isGoogleConfigured) {
      setShowGoogleGuide(true);
      return;
    }
    handleCustomGoogleLogin();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Publik</span>
          </Link>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>

        <div className="p-8 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold font-display">Panel Admin CMS</h1>
            <p className="text-xs text-zinc-500">Masuk dengan kredensial administrator Anda.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google SSO Login Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onGoogleButtonClick}
              className="w-full py-2.5 px-4 rounded-xl border border-subtle bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            >
              <GoogleIcon />
              <span>Pilih & Login dengan Akun Google</span>
            </button>

            {showGoogleGuide && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <div className="flex items-center space-x-1.5 font-bold">
                  <HelpCircle className="w-4 h-4" />
                  <span>Google Client ID Belum Dikonfigurasi</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Untuk mengaktifkan Google Login, Anda perlu membuat <strong>Google Client ID</strong> di <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline font-bold">Google Cloud Console</a> dan memasangnya di file <code>client/.env</code>:
                </p>
                <code className="block p-2 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-[10px] text-amber-900 dark:text-amber-100">
                  VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
                </code>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-subtle w-full"></div>
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono uppercase text-zinc-400 absolute">atau email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login ke Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
