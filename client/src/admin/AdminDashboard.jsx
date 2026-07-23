import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FileText, FolderGit2, Inbox, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ posts: 0, projects: 0, messages: 0, unreadMessages: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [postsRes, projectsRes, messagesRes] = await Promise.all([
          api.get('/admin/posts'),
          api.get('/admin/projects'),
          api.get('/admin/messages')
        ]);

        const posts = postsRes.data.data || [];
        const projects = projectsRes.data.data || [];
        const messages = messagesRes.data.data || [];
        const unread = messages.filter(m => !m.is_read).length;

        setStats({
          posts: posts.length,
          projects: projects.length,
          messages: messages.length,
          unreadMessages: unread
        });

        setRecentMessages(messages.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard Overview</h1>
        <p className="text-sm text-zinc-500">Ringkasan statistik dan pesan terbaru di website Anda.</p>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500">Loading metrics...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/posts" className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 hover:border-zinc-400 transition-all flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500">Total Artikel Blog</span>
                <div className="text-3xl font-extrabold font-display">{stats.posts}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <FileText className="w-5 h-5" />
              </div>
            </Link>

            <Link to="/admin/projects" className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 hover:border-zinc-400 transition-all flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500">Total Proyek Portofolio</span>
                <div className="text-3xl font-extrabold font-display">{stats.projects}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <FolderGit2 className="w-5 h-5" />
              </div>
            </Link>

            <Link to="/admin/inbox" className="p-5 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 hover:border-zinc-400 transition-all flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500">Pesan Masuk (Unread)</span>
                <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">{stats.unreadMessages}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Inbox className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Recent Messages Table */}
          <div className="p-6 rounded-2xl border border-subtle bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Pesan Masuk Terbaru</h2>
              <Link to="/admin/inbox" className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center space-x-1">
                <span>Lihat Semua Inbox</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="text-sm text-zinc-500 py-4 text-center">Belum ada pesan masuk.</div>
            ) : (
              <div className="divide-y divide-subtle">
                {recentMessages.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.name} <span className="text-zinc-400 font-normal">({m.email})</span>
                      </div>
                      <p className="text-zinc-500 line-clamp-1">{m.subject || m.message}</p>
                    </div>
                    <span className="font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
