import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ExternalLink, Code2 } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

import { useLanguage } from '../context/LanguageContext';

const Portfolio = ({ settings }) => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get('/public/projects');
        if (res.data.success) {
          setProjects(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load portfolio projects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const categories = React.useMemo(() => {
    const cats = projects.map(p => p.category).filter(Boolean);
    return ['all', ...new Set(cats)];
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <main className="flex-grow space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
          {t(settings?.portfolio_title) || 'Portofolio & Proyek'}
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          {t(settings?.portfolio_desc) || 'Kumpulan alat open-source, pustaka sistem, dan aplikasi web yang telah saya bangun.'}
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 text-xs font-medium pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedCategory === cat
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                : 'border-subtle bg-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
            }`}
          >
            {cat === 'all' ? 'Semua Proyek' : cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="space-y-6 pt-4 border-t border-subtle">
        {loading ? (
          <div className="text-sm font-mono text-zinc-500">Memuat proyek...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center">
            Belum ada proyek dalam kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {p.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {p.github_url && (
                        <a href={p.github_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {p.project_url && (
                        <a href={p.project_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {p.description_id || p.description_en}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  {p.tags && p.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Portfolio;
