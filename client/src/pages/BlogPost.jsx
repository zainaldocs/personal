import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/public/posts/${slug}`);
        if (res.data.success) {
          setPost(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="py-12 text-center text-sm font-mono text-zinc-500">Memuat artikel...</div>;
  }

  if (error || !post) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Artikel Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-500">Artikel yang Anda cari tidak ada atau telah dihapus.</p>
        <Link to="/blog" className="inline-flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="flex-grow space-y-8">
      <Link to="/blog" className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Semua Artikel</span>
      </Link>

      <header className="space-y-4 pb-6 border-b border-subtle">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500">
          <span className="inline-flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">{post.category}</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{post.read_time}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50 leading-tight">
          {post.title_id || post.title_en}
        </h1>
      </header>

      {/* Content Rendering */}
      <div 
        className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: post.content_id || post.content_en }}
      />
    </article>
  );
};

export default BlogPost;
