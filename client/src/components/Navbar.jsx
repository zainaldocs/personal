import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X } from 'lucide-react';

const Navbar = ({ settings }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Beranda' },
    { path: '/about', label: 'Tentang' },
    { path: '/blog', label: 'Blog' },
    { path: '/portfolio', label: 'Portofolio' },
    { path: '/contact', label: 'Kontak' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const brandTitle = settings?.site_title?.id || settings?.site_title?.en || 'zainal.co';

  return (
    <header className="sticky top-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-subtle transition-colors">
      <div className="max-w-3xl mx-auto w-full px-6 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="group flex items-center space-x-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity">
          <span className="w-3 h-3 rounded-full bg-zinc-900 dark:bg-zinc-100 inline-block group-hover:scale-125 transition-transform"></span>
          <span className="font-display">{brandTitle}</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-1 transition-colors ${
                isActive(item.path)
                  ? 'font-bold text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-6 border-b border-subtle flex flex-col space-y-4 md:hidden shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 text-base ${
                isActive(item.path)
                  ? 'font-bold text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
