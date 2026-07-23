import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Moon, Sun, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', labelId: 'Beranda', labelEn: 'Home' },
    { path: '/about', labelId: 'Tentang', labelEn: 'About' },
    { path: '/blog', labelId: 'Blog', labelEn: 'Blog' },
    { path: '/portfolio', labelId: 'Portofolio', labelEn: 'Portfolio' },
    { path: '/contact', labelId: 'Kontak', labelEn: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="mb-14 pb-6 border-b border-subtle flex items-center justify-between">
      <Link to="/" className="group flex items-center space-x-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity">
        <span className="w-3 h-3 rounded-full bg-zinc-900 dark:bg-zinc-100 inline-block group-hover:scale-125 transition-transform"></span>
        <span className="font-display">teguh.co</span>
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
            {lang === 'id' ? item.labelId : item.labelEn}
          </Link>
        ))}
      </nav>

      {/* Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 rounded-lg border border-subtle text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all flex items-center space-x-1.5"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang.toUpperCase()}</span>
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-all"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 z-50 bg-white dark:bg-zinc-950 p-6 border-b border-subtle flex flex-col space-y-4 md:hidden shadow-lg">
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
              {lang === 'id' ? item.labelId : item.labelEn}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
