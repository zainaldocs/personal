import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useAuth();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.data.token);
        setProfileStatus({ type: 'success', message: 'Profil berhasil diperbarui.' });
        setTimeout(() => setProfileStatus(null), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui profil.';
      setProfileStatus({ type: 'error', message: msg });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordStatus(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      setPasswordSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Password baru minimal harus 8 karakter.' });
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        setPasswordStatus({ type: 'success', message: 'Kata sandi berhasil diperbarui.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordStatus(null), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui kata sandi.';
      setPasswordStatus({ type: 'error', message: msg });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Profil Saya & Keamanan</h1>
        <p className="text-sm text-zinc-500">Kelola nama akun, email login, dan perbarui kata sandi administrator.</p>
      </div>

      {/* Form Update Profile */}
      <div className="p-6 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-subtle">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display">Informasi Akun Admin</h2>
            <p className="text-xs text-zinc-500">Ubah nama tampilan dan alamat email login Anda.</p>
          </div>
        </div>

        {profileStatus && (
          <div className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
            profileStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {profileStatus.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{profileStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nama Tampilan Admin *</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Login Admin *</label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{profileSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </form>
      </div>

      {/* Form Change Password */}
      <div className="p-6 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-subtle">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display">Perbarui Kata Sandi (Password)</h2>
            <p className="text-xs text-zinc-500">Amankan akun Anda dengan kata sandi baru yang kuat (minimal 8 karakter).</p>
          </div>
        </div>

        {passwordStatus && (
          <div className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
            passwordStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {passwordStatus.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password Saat Ini *</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password Baru *</label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Minimal 8 karakter"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Konfirmasi Password Baru *</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
                className="w-full p-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-950 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{passwordSaving ? 'Memproses...' : 'Perbarui Kata Sandi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
