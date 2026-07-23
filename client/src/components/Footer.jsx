import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ settings }) => {
  const currentYear = new Date().getFullYear();
  const ownerName = settings?.site_owner_name?.id || settings?.site_owner_name?.en || 'Zainal Abidin';

  return (
    <footer className="mt-20 pt-8 border-t border-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
      <div>© {currentYear} {ownerName}. Hak cipta dilindungi.</div>
      <div className="flex items-center space-x-4">
        <a href={settings?.social_github?.id || 'https://github.com'} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</a>
        <a href={settings?.social_twitter?.id || 'https://twitter.com'} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Twitter</a>
        <a href={settings?.social_linkedin?.id || 'https://linkedin.com'} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">LinkedIn</a>
        <Link to="/admin/login" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-40 hover:opacity-100 font-mono">Admin</Link>
      </div>
    </footer>
  );
};

export default Footer;
