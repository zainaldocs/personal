const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  let connection;
  try {
    console.log('🌱 Starting Database Initialization & Seeding...');

    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'personal_portfolio_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' verified.`);
    await tempConnection.end();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      multipleStatements: true
    });

    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schemaSql);
    console.log('✅ All DB tables verified/created successfully from schema.sql.');

    // Seed Admin User
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@teguh.co']);
    if (existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('AdminSecret123!', 10);
      await connection.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        ['Admin Portfolio', 'admin@teguh.co', hashedPassword]
      );
      console.log('🔑 Default Admin created: admin@teguh.co / AdminSecret123!');
    }

    // Seed Initial Site Settings
    const defaultSettings = [
      {
        key: 'site_title',
        id: 'zainal.co',
        en: 'zainal.co'
      },
      {
        key: 'site_owner_name',
        id: 'Zainal Abidin',
        en: 'Zainal Abidin'
      },
      {
        key: 'hero_status',
        id: 'Tersedia untuk Konsultasi & Proyek Q3/Q4',
        en: 'Available for Advisory & Projects Q3/Q4'
      },
      {
        key: 'hero_title',
        id: 'Halo, saya Software Engineer, Penulis & Arsitek Sistem.',
        en: "Hi, I'm Software Engineer, Writer & Systems Architect."
      },
      {
        key: 'hero_desc',
        id: 'Saya merancang infrastruktur web yang andal, mendesain pengalaman pengembang yang intuitif, dan menulis tentang pola desain perangkat lunak.',
        en: 'I design reliable web infrastructure, build intuitive developer experiences, and write about software design patterns.'
      },
      {
        key: 'about_title',
        id: 'Tentang Zainal Arifin',
        en: 'About Zainal Arifin'
      },
      {
        key: 'about_desc',
        id: 'Saya merancang infrastruktur web yang andal, mendesain pengalaman pengembang yang intuitif, dan menulis tentang pola desain perangkat lunak.',
        en: 'I design reliable web infrastructure, build intuitive developer experiences, and write about software design patterns.'
      },
      {
        key: 'blog_title',
        id: 'Tulisan & Artikel',
        en: 'Writing & Articles'
      },
      {
        key: 'blog_desc',
        id: 'Pemikiran, panduan teknis, dan catatan arsitektur mengenai pengembangan perangkat lunak dan desain sistem.',
        en: 'Thoughts, technical guides, and architectural notes on software development and systems design.'
      },
      {
        key: 'portfolio_title',
        id: 'Portofolio & Proyek',
        en: 'Portfolio & Projects'
      },
      {
        key: 'portfolio_desc',
        id: 'Kumpulan alat open-source, pustaka sistem, dan aplikasi web yang telah saya bangun.',
        en: 'A collection of open-source tools, system libraries, and web applications I have built.'
      },
      {
        key: 'contact_title',
        id: 'Hubungi Saya',
        en: 'Contact Me'
      },
      {
        key: 'contact_desc',
        id: 'Apakah Anda memiliki proyek, diskusi arsitektur sistem terdistribusi, atau konsultasi teknis? Kirimkan pesan di bawah ini.',
        en: 'Do you have a project, distributed systems architecture discussion, or technical consulting? Send a message below.'
      },
      {
        key: 'contact_email',
        id: 'admin@zainal.co',
        en: 'admin@zainal.co'
      },
      {
        key: 'social_github',
        id: 'https://github.com',
        en: 'https://github.com'
      },
      {
        key: 'social_twitter',
        id: 'https://x.com',
        en: 'https://x.com'
      },
      {
        key: 'social_linkedin',
        id: 'https://linkedin.com',
        en: 'https://linkedin.com'
      }
    ];

    for (const setting of defaultSettings) {
      await connection.query(
        `INSERT IGNORE INTO site_settings (setting_key, value_id, value_en)
         VALUES (?, ?, ?)`,
        [setting.key, setting.id, setting.en]
      );
    }
    console.log('✅ Default Site Settings seeded if not already present.');

    // Seed Sample Projects
    const [existingProjects] = await connection.query('SELECT COUNT(*) as count FROM projects');
    if (existingProjects[0].count === 0) {
      await connection.query(`
        INSERT INTO projects (slug, title, description_id, description_en, category, tags, project_url, github_url, is_featured, sort_order) VALUES
        (
          'hyper-cache-engine',
          'HyperCache Engine',
          'In-memory key-value store berkinerja tinggi yang dibangun dengan Rust, mendukung pub/sub dan persistensi snapshot.',
          'High-performance in-memory key-value store built with Rust, supporting pub/sub and snapshot persistence.',
          'System',
          '["Rust", "Distributed Systems", "CLI"]',
          'https://github.com',
          'https://github.com',
          1, 1
        ),
        (
          'nexus-api-gateway',
          'Nexus API Gateway',
          'API Gateway ringan berbasis Node.js dengan rate-limiting otomatis, otentikasi JWT, dan penyeimbang beban terdistribusi.',
          'Lightweight Node.js API Gateway with automatic rate-limiting, JWT auth, and distributed load balancing.',
          'Backend',
          '["Node.js", "Express", "Docker"]',
          'https://github.com',
          'https://github.com',
          1, 2
        )
      `);
      console.log('✅ Sample Projects seeded.');
    }

    // Seed Sample Posts
    const [existingPosts] = await connection.query('SELECT COUNT(*) as count FROM posts');
    if (existingPosts[0].count === 0) {
      await connection.query(`
        INSERT INTO posts (slug, title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, is_published) VALUES
        (
          'memahami-arsitektur-event-driven',
          'Memahami Arsitektur Event-Driven di Sistem Terdistribusi',
          'Understanding Event-Driven Architecture in Distributed Systems',
          '<p>Arsitektur Event-Driven (EDA) adalah pola arsitektur perangkat lunak yang memungkinkan komponen aplikasi berkomunikasi secara asinkronus melalui peristiwa (events)...</p>',
          '<p>Event-Driven Architecture (EDA) is a software design pattern enabling components to communicate asynchronously through events...</p>',
          'Panduan mendalam mengenai bagaimana event-driven architecture dapat meningkatkan skalabilitas dan fleksibilitas sistem terdistribusi modern.',
          'An in-depth guide on how event-driven architecture improves scalability and flexibility in modern distributed systems.',
          'Architecture',
          '6 min baca',
          1
        )
      `);
      console.log('✅ Sample Posts seeded.');
    }

    // Seed Sample Experiences
    const [existingExperiences] = await connection.query('SELECT COUNT(*) as count FROM experiences');
    if (existingExperiences[0].count === 0) {
      await connection.query(`
        INSERT INTO experiences (role_id, role_en, company, period, description_id, description_en, sort_order) VALUES
        (
          'Senior Systems Architect',
          'Senior Systems Architect',
          'TechCorp Global',
          '2023 — Sekarang',
          'Memimpin perancangan arsitektur microservices skala besar dan migrasi infrastruktur ke Kubernetes.',
          'Leading large-scale microservices architecture design and infrastructure migration to Kubernetes.',
          1
        ),
        (
          'Lead Backend Engineer',
          'Lead Backend Engineer',
          'DataSystems Inc.',
          '2021 — 2023',
          'Mengembangkan RESTful API berkinerja tinggi dengan Express.js dan PostgreSQL untuk melayani jutaan transaksi harian.',
          'Developed high-performance RESTful APIs with Express.js and PostgreSQL serving millions of daily transactions.',
          2
        )
      `);
      console.log('✅ Sample Experiences seeded.');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
