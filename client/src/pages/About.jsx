import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { Code2, Terminal } from 'lucide-react';

const About = ({ settings }) => {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await api.get('/public/experiences');
        if (res.data.success) {
          setExperiences(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load experiences', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <main className="flex-grow space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
          Tentang Teguh Pratama
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t(settings?.hero_desc) || 'Software Engineer & Systems Architect dengan fokus pada pembuatan sistem terdistribusi, infrastruktur cloud, serta pengalaman pengembang yang intuitif.'}
        </p>
      </div>

      {/* Tech Stack & Focus */}
      <div className="space-y-4 pt-4 border-t border-subtle">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Fokus & Spesialisasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Distributed Systems & Cloud</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Merancang arsitektur microservices, Kubernetes, caching layer, serta CI/CD pipelines.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-subtle bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Full-Stack Web Engineering</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Pengembangan frontend React/TypeScript modern & REST API Node.js/Express berkinerja tinggi.
            </p>
          </div>
        </div>
      </div>

      {/* Career Timeline */}
      <div className="space-y-6 pt-4 border-t border-subtle">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Pengalaman Kerja
        </h2>

        {loading ? (
          <div className="text-sm font-mono text-zinc-500">Memuat pengalaman...</div>
        ) : (
          <div className="space-y-6 relative border-l border-subtle pl-6 ml-2">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors"></span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {exp.role_id || exp.role_en}
                    <span className="text-zinc-400 font-normal"> @ {exp.company}</span>
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">{exp.period}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {exp.description_id || exp.description_en}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default About;
