import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminPosts from './admin/AdminPosts';
import AdminProjects from './admin/AdminProjects';
import AdminExperiences from './admin/AdminExperiences';
import AdminInbox from './admin/AdminInbox';
import AdminSettings from './admin/AdminSettings';

import api from './api/axios';

const PublicLayout = ({ children, settings }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      <div className="max-w-3xl mx-auto w-full px-6 sm:px-8 py-8 sm:py-12 flex-grow flex flex-col justify-between">
        <Navbar />
        {children}
        <Footer settings={settings} />
      </div>
    </div>
  );
};

function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load global site settings', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLayout settings={settings}><Home settings={settings} /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout settings={settings}><About settings={settings} /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout settings={settings}><Blog /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout settings={settings}><BlogPost /></PublicLayout>} />
      <Route path="/portfolio" element={<PublicLayout settings={settings}><Portfolio /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout settings={settings}><Contact settings={settings} /></PublicLayout>} />

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="experiences" element={<AdminExperiences />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
