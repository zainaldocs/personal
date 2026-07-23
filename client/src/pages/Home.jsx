import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, ChevronRight, ExternalLink } from 'lucide-react';

const Home = ({ settings }) => {
  const { t } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, postRes] = await Promise.all([
          api.get('/public/projects?featured=true'),
          api.get('/public/posts?is_published=1')
        ]);

        if (projRes.data.success) {
          setFeaturedProjects(projRes.data.data.slice(0, 2));
        }
        if (postRes.data.success) {
          setRecentArticles(postRes.data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex-grow space-y-16">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-300/40 dark:border-zinc-700/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t(settings?.hero_status) || 'Tersedia untuk Konsultasi & Proyek Q3/Q4'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50 leading-tight">
          {t(settings?.hero_title) || 'Halo, saya Teguh Pratama — Software Engineer, Penulis & Arsitek Sistem.'}
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          {t(settings?.hero_desc) || 'Saya merancang infrastruktur web yang andal, mendesain pengalaman pengembang yang intuitif, dan menulis tentang pola desain perangkat lunak.'}
        </p>

        <div className="pt-2 flex flex-wrap gap-4 items-center text-sm font-medium">
          <Link to="/portfolio" className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center space-x-2">
            <span>Lihat Karya Pilihan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/contact" className="px-5 py-2.5 rounded-lg border border-subtle text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            Hubungi Saya
          </Link>
        </div>
      </div>

      {/* Selected Work Section */}
      <div className="space-y-6 pt-6 border-t border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Karya Pilihan
          </h2>
          <Link to="/portfolio" className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center space-x-1">
            <span>Semua Proyek</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500 font-mono py-4">Memuat proyek...</div>
        ) : (
          <div className="space-y-4">
            {featuredProjects.map((p) => (
              <a
                key={p.id}
                href={p.project_url || p.github_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="block p-5 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:underline">
                        {p.title}
                      </h3>
                      {p.tags && p.tags.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {p.tags[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {p.description_id || p.description_en}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Recent Articles Section */}
      <div className="space-y-6 pt-6 border-t border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Artikel Terbaru
          </h2>
          <Link to="/blog" className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center space-x-1">
            <span>Baca Blog</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500 font-mono py-4">Memuat artikel...</div>
        ) : (
          <div className="divide-y divide-subtle">
            {recentArticles.map((art) => (
              <article key={art.id} className="py-4 first:pt-0 last:pb-0 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <Link to={`/blog/${art.slug}`} className="font-semibold text-base text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {art.title_id || art.title_en}
                  </Link>
                  <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                    {art.published_at ? new Date(art.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} · {art.read_time}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {art.excerpt_id || art.excerpt_en}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
