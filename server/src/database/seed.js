const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Initialization & Seeding...');

    // 0. Connect without specifying DB to create database
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'teguh_portfolio_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConnection.end();

    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'teguh_portfolio_db',
      waitForConnections: true,
      connectionLimit: 10
    });

    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        value_id TEXT,
        value_en TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(200) UNIQUE NOT NULL,
        title_id VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        content_id LONGTEXT NOT NULL,
        content_en LONGTEXT NOT NULL,
        excerpt_id TEXT,
        excerpt_en TEXT,
        category VARCHAR(100) NOT NULL,
        read_time VARCHAR(50) DEFAULT '5 min baca',
        is_published TINYINT(1) DEFAULT 1,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(200) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description_id TEXT NOT NULL,
        description_en TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        tags JSON NOT NULL,
        project_url VARCHAR(255),
        github_url VARCHAR(255),
        is_featured TINYINT(1) DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id VARCHAR(200) NOT NULL,
        role_en VARCHAR(200) NOT NULL,
        company VARCHAR(200) NOT NULL,
        period VARCHAR(100) NOT NULL,
        description_id TEXT,
        description_en TEXT,
        sort_order INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Tables checked/created.');

    // 2. Seed Default Admin User
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@teguh.co']);
    if (existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('AdminSecret123!', 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        ['Teguh Pratama Admin', 'admin@teguh.co', hashedPassword]
      );
      console.log('🔑 Default Admin created: admin@teguh.co / AdminSecret123!');
    }

    // 3. Seed Site Settings
    const defaultSettings = [
      {
        key: 'hero_status',
        id: 'Tersedia untuk Konsultasi & Proyek Q3/Q4',
        en: 'Available for Q3/Q4 Advisory & Projects'
      },
      {
        key: 'hero_title',
        id: 'Halo, saya Teguh Pratama — Software Engineer, Penulis & Arsitek Sistem.',
        en: "Hi, I'm Teguh Pratama — Software Engineer, Writer & Systems Architect."
      },
      {
        key: 'hero_desc',
        id: 'Saya merancang infrastruktur web yang andal, mendesain pengalaman pengembang yang intuitif, dan menulis tentang pola desain perangkat lunak, sistem terdistribusi, serta teknologi modern.',
        en: 'I craft resilient web infrastructure, design intuitive developer experiences, and write about software design patterns, distributed systems, and modern technology.'
      },
      {
        key: 'contact_email',
        id: 'teguh@example.com',
        en: 'teguh@example.com'
      },
      {
        key: 'social_github',
        id: 'https://github.com',
        en: 'https://github.com'
      },
      {
        key: 'social_twitter',
        id: 'https://twitter.com',
        en: 'https://twitter.com'
      },
      {
        key: 'social_linkedin',
        id: 'https://linkedin.com',
        en: 'https://linkedin.com'
      }
    ];

    for (const setting of defaultSettings) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, value_id, value_en)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value_id = VALUES(value_id), value_en = VALUES(value_en)`,
        [setting.key, setting.id, setting.en]
      );
    }
    console.log('⚙️ Default Site Settings seeded.');

    // 4. Seed Posts
    const [existingPosts] = await pool.query('SELECT * FROM posts LIMIT 1');
    if (existingPosts.length === 0) {
      const posts = [
        {
          slug: 'mendesain-arsitektur-microservices-tanpa-downtime-2026',
          title_id: 'Mendesain Arsitektur Microservices Tanpa Downtime di 2026',
          title_en: 'Architecting Zero-Downtime Microservices in 2026',
          excerpt_id: 'Pelajaran penting dari penerapan state machine terdistribusi di cluster Kubernetes multi-wilayah tanpa gangguan pengguna.',
          excerpt_en: 'Key lessons learned from deploying distributed state machines across multi-region Kubernetes clusters with zero client disruption.',
          content_id: 'Dalam arsitektur terdistribusi modern, mencapai zero downtime adalah standar emas...',
          content_en: 'In modern distributed architecture, achieving zero downtime is the gold standard...',
          category: 'Architecture',
          read_time: '6 min baca',
          published_at: '2026-07-12 10:00:00'
        },
        {
          slug: 'filosofi-zen-dalam-arsitektur-frontend-minimalis',
          title_id: 'Filosofi Zen dalam Arsitektur Frontend Minimalis',
          title_en: 'The Zen of Minimalist Frontend Architecture',
          excerpt_id: 'Mengapa menghapus abstraksi yang tidak perlu dan dependen berat dapat menghasilkan perangkat lunak yang jauh lebih cepat dan mudah dirawat.',
          excerpt_en: 'Why stripping unnecessary abstractions, oversized third-party dependencies, and complex build steps results in faster software.',
          content_id: 'Minimalisme bukan hanya soal tampilan visual, tetapi juga filosofi kode...',
          content_en: 'Minimalism is not just a visual aesthetic, but a core coding philosophy...',
          category: 'Frontend',
          read_time: '4 min baca',
          published_at: '2026-06-28 14:30:00'
        }
      ];

      for (const p of posts) {
        await pool.query(
          `INSERT INTO posts (slug, title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.slug, p.title_id, p.title_en, p.content_id, p.content_en, p.excerpt_id, p.excerpt_en, p.category, p.read_time, p.published_at]
        );
      }
      console.log('📝 Sample Blog Posts seeded.');
    }

    // 5. Seed Projects
    const [existingProjects] = await pool.query('SELECT * FROM projects LIMIT 1');
    if (existingProjects.length === 0) {
      const projects = [
        {
          slug: 'edgecache-cli',
          title: 'EdgeCache CLI',
          description_id: 'Lapisan edge caching terdistribusi berkinerja tinggi untuk arsitektur microservices modern.',
          description_en: 'High-performance distributed edge caching layer for modern microservice architectures.',
          category: 'System',
          tags: JSON.stringify(['Rust', 'CLI', 'Distributed Systems']),
          project_url: 'https://github.com',
          github_url: 'https://github.com',
          is_featured: 1,
          sort_order: 1
        },
        {
          slug: 'typeflow-ui',
          title: 'TypeFlow UI',
          description_id: 'Sistem komponen UI minimalis dan aksesibel untuk platform editorial dengan kecepatan tinggi.',
          description_en: 'Minimalist accessible design system components built for high-speed editorial platforms.',
          category: 'Frontend',
          tags: JSON.stringify(['TypeScript', 'React', 'Tailwind CSS']),
          project_url: 'https://github.com',
          github_url: 'https://github.com',
          is_featured: 1,
          sort_order: 2
        }
      ];

      for (const pr of projects) {
        await pool.query(
          `INSERT INTO projects (slug, title, description_id, description_en, category, tags, project_url, github_url, is_featured, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pr.slug, pr.title, pr.description_id, pr.description_en, pr.category, pr.tags, pr.project_url, pr.github_url, pr.is_featured, pr.sort_order]
        );
      }
      console.log('🚀 Sample Portfolio Projects seeded.');
    }

    // 6. Seed Experiences
    const [existingExp] = await pool.query('SELECT * FROM experiences LIMIT 1');
    if (existingExp.length === 0) {
      const experiences = [
        {
          role_id: 'Senior Systems Architect',
          role_en: 'Senior Systems Architect',
          company: 'TechCorp Global',
          period: '2024 — Sekarang',
          description_id: 'Memimpin perancangan infrastruktur cloud terdistribusi dan migrasi microservices.',
          description_en: 'Leading distributed cloud infrastructure design and microservices migration.',
          sort_order: 1
        },
        {
          role_id: 'Lead Fullstack Engineer',
          role_en: 'Lead Fullstack Engineer',
          company: 'Nexus Software',
          period: '2022 — 2024',
          description_id: 'Mengembangkan sistem editorial skala besar dengan arsitektur headless CMS.',
          description_en: 'Developed large scale editorial system with headless CMS architecture.',
          sort_order: 2
        }
      ];

      for (const e of experiences) {
        await pool.query(
          `INSERT INTO experiences (role_id, role_en, company, period, description_id, description_en, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [e.role_id, e.role_en, e.company, e.period, e.description_id, e.description_en, e.sort_order]
        );
      }
      console.log('💼 Sample Experiences seeded.');
    }

    console.log('🎉 Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
