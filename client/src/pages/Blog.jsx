import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Architecture', 'Frontend', 'DevOps', 'System'];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let url = `/public/posts?is_published=1`;
        if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

        const res = await api.get(url);
        if (res.data.success) {
          setPosts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load blog posts', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPosts, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <main className="flex-grow space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
          Tulisan & Artikel
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          Pemikiran, panduan teknis, dan catatan arsitektur mengenai pengembangan perangkat lunak dan desain sistem.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 pt-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel berdasarkan judul atau kata kunci..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
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
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-6 pt-4 border-t border-subtle">
        {loading ? (
          <div className="text-sm font-mono text-zinc-500">Memuat artikel...</div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center">
            Tidak ada artikel yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="divide-y divide-subtle">
            {posts.map((art) => (
              <article key={art.id} className="py-5 first:pt-0 last:pb-0 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <Link to={`/blog/${art.slug}`} className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {art.title_id || art.title_en}
                  </Link>
                  <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                    {art.published_at ? new Date(art.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} · {art.read_time}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {art.excerpt_id || art.excerpt_en}
                </p>
                <div className="mt-2 inline-block">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {art.category}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Blog;
