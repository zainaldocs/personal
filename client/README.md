# 🚀 Teguh Pratama — Frontend & Admin Panel CMS (React + Vite)

Antarmuka web publik dan **Panel Admin CMS** dinamis untuk situs portofolio dan blog **Teguh Pratama** (*Software Engineer & Systems Architect*), dibangun menggunakan **React 19**, **Vite**, dan **Tailwind CSS v4**.

---

## ✨ Fitur Utama

### 🌐 Antarmuka Publik (Public Site)
* **Beranda (`/`)**: Banner status ketersediaan dinamis, judul hero, biografi singkat, top 2 karya pilihan, dan top 2 artikel terbaru.
* **Tentang (`/about`)**: Profil profesional, keahlian teknis, dan *timeline* riwayat pengalaman karir dari database.
* **Blog (`/blog`)**: Daftar artikel dengan fitur **Pencarian Kata Kunci (*Live Search*)** dan **Filter Kategori** (*Architecture*, *Frontend*, *DevOps*, dll).
* **Detail Artikel (`/blog/:slug`)**: Tampilan baca postingan blog lengkap dengan sanitasi HTML.
* **Portofolio (`/portfolio`)**: Showcase proyek teknis dengan tag teknologi dan filter kategori.
* **Kontak (`/contact`)**: Formulir kirim pesan interaktif yang terhubung langsung ke database & Inbox Admin.
* **Multi-Language (ID / EN)**: Dukungan alih bahasa instan (Bahasa Indonesia & Bahasa Inggris) berbasis React Context.
* **Dark / Light Mode**: Mode gelap/terang otomatis dengan retensi di `localStorage`.

### 🔐 Panel Admin CMS (`/admin`)
* **Otentikasi Admin (`/admin/login`)**: Halaman login aman berbasis JWT (JSON Web Token).
* **Dashboard Overview (`/admin/dashboard`)**: Metrik ringkas total artikel, proyek, dan pesan masuk belum dibaca.
* **Kelola Blog (`/admin/posts`)**: CRUD artikel dengan **Tab Switcher Konten Bilingual (ID & EN)**.
* **Kelola Portofolio (`/admin/projects`)**: CRUD proyek portofolio, tag teknologi, dan penentuan proyek pilihan (*Featured*).
* **Kelola Pengalaman (`/admin/experiences`)**: CRUD timeline kerja & pendidikan.
* **Kelola Inbox (`/admin/inbox`)**: Membaca, menandai sudah dibaca, dan menghapus pesan masuk dari pengunjung.
* **Pengaturan Situs (`/admin/settings`)**: Mengubah teks banner, bio hero, email, dan link sosial media secara *real-time*.

---

## 🛠️ Stack Teknologi

* **Framework UI**: React 19 (`react`, `react-dom`)
* **Build Tool & Server**: Vite 8 (`vite`)
* **Routing**: React Router v7 (`react-router-dom`)
* **HTTP Client**: Axios (`axios`)
* **Ikon UI**: Lucide React (`lucide-react`)
* **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss`, `autoprefixer`)

---

## 📁 Struktur Folder `client/src/`

```
client/src/
├── admin/                 # Halaman & Komponen Panel Admin CMS
│   ├── AdminDashboard.jsx
│   ├── AdminExperiences.jsx
│   ├── AdminInbox.jsx
│   ├── AdminLayout.jsx
│   ├── AdminLogin.jsx
│   ├── AdminPosts.jsx
│   ├── AdminProjects.jsx
│   └── AdminSettings.jsx
├── api/                   # Konfigurasi Axios & Interceptor JWT
│   └── axios.js
├── components/            # Komponen Publik Reusable (Navbar, Footer)
│   ├── Footer.jsx
│   └── Navbar.jsx
├── context/               # Global State Providers (Auth, Theme, Language)
│   ├── AuthContext.jsx
│   ├── LanguageContext.jsx
│   └── ThemeContext.jsx
├── pages/                 # Halaman Publik
│   ├── About.jsx
│   ├── Blog.jsx
│   ├── BlogPost.jsx
│   ├── Contact.jsx
│   ├── Home.jsx
│   └── Portfolio.jsx
├── App.jsx                # Router Utama Aplikasi
├── index.css              # Global CSS & Import Google Fonts / Tailwind
└── main.jsx               # Entry Point React dengan Context Providers
```

---

## ⚙️ Cara Menjalankan (Perintah Lintas CLI)

### 1. Jalankan Dev Server (Lokal)
```bash
npm run dev
```
Aplikasi akan berjalan di `http://127.0.0.1:5173`.

### 2. Build untuk Produksi
```bash
npm run build
```
Hasil kompilasi produksi siap rilis akan dihasilkan di folder `dist/`.

### 3. Pratinjau Hasil Build Produksi
```bash
npm run preview
```

---

## 🔗 Integrasi Backend API

Aplikasi React ini berkomunikasi dengan backend REST API Express.js yang berjalan di `http://localhost:5000/api`. Konfigurasi dasar *base URL* dan *Header Authorization Bearer Token* dapat disesuaikan pada berkas `src/api/axios.js`.
