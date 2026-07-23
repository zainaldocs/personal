import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShieldCheck, ShieldAlert, Clock, RefreshCw, Monitor } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Audit Log Trail & Keamanan</h1>
          <p className="text-sm text-zinc-500">Riwayat transparan seluruh aktivitas login dan perubahan profil admin.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl border border-subtle bg-white dark:bg-zinc-900 text-xs font-semibold flex items-center space-x-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="text-sm font-mono text-zinc-500 py-4">Memuat riwayat log...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center border border-subtle rounded-2xl bg-white dark:bg-zinc-900 text-sm text-zinc-500">
          Belum ada riwayat aktivitas keamanan tercatat.
        </div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/80 dark:bg-zinc-800/40 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4">Status & Aktivitas</th>
                <th className="p-4">Alamat IP</th>
                <th className="p-4">Browser / Device</th>
                <th className="p-4 text-right">Waktu (WIB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-2.5">
                      {log.status === 'SUCCESS' ? (
                        <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                        </span>
                      )}
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{log.action}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {log.user_email ? `User: ${log.user_email}` : 'Sistem / Guest'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {log.ip_address}
                  </td>
                  <td className="p-4 max-w-xs truncate text-zinc-500 font-mono text-[11px]" title={log.user_agent}>
                    <div className="flex items-center space-x-1">
                      <Monitor className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                      <span className="truncate">{log.user_agent || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-zinc-400 whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
