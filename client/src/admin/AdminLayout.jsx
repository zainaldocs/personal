import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { LayoutDashboard, FileText, FolderGit2, Briefcase, Inbox, Settings, User, ShieldCheck, LogOut, Moon, Sun, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [brandTitle, setBrandTitle] = useState('zainal.co');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success && res.data.data?.site_title) {
          setBrandTitle(res.data.data.site_title.id || res.data.data.site_title.en || 'zainal.co');
        }
      } catch (err) {
        console.error('Failed to fetch admin brand title', err);
      }
    };
    fetchBrand();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-sm text-zinc-500">Checking auth session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/posts', label: 'Blog & Artikel', icon: FileText },
    { path: '/admin/projects', label: 'Portofolio', icon: FolderGit2 },
    { path: '/admin/experiences', label: 'Pengalaman', icon: Briefcase },
    { path: '/admin/inbox', label: 'Pesan Masuk', icon: Inbox },
    { path: '/admin/settings', label: 'Pengaturan Situs', icon: Settings },
    { path: '/admin/logs', label: 'Audit Log Trail', icon: ShieldCheck },
    { path: '/admin/profile', label: 'Profil Saya', icon: User },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-subtle sticky top-0 z-40">
        <Link to="/" className="font-display font-extrabold text-base flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>{brandTitle} <span className="text-xs font-mono text-zinc-400">admin</span></span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Overlay Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sticky Sidebar on Desktop */}
      <aside className={`
        fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-subtle p-6 flex flex-col justify-between overflow-y-auto
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          <div className="hidden md:flex items-center justify-between">
            <Link to="/" className="font-display font-extrabold text-lg flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{brandTitle} <span className="text-xs font-mono text-zinc-400">admin</span></span>
            </Link>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-subtle space-y-4">
          <Link to="/admin/profile" className="text-xs font-mono text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 block transition-colors">
            Logged in as <span className="font-bold text-zinc-700 dark:text-zinc-300 block truncate">{user?.email}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-5xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
