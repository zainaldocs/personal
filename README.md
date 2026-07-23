# 🚀 Personal Website & Admin Panel CMS (MARN Stack)

Web portofolio & blog dinamis modern berbasis **MARN Stack** (*MariaDB + Express.js + React + Node.js*) dengan fitur **Panel Admin CMS**, **TipTap Rich Text Editor**, **Google OAuth 2.0 SSO**, **Security Audit Log Trail**, dan **Dynamic SMTP Mailer**.

---

## ✨ Fitur & Keunggulan Utama

### 🌐 1. Antarmuka Publik (Public Viewers)
* **Design System Sleek & Minimalis**: Estetika modern dengan palet warna Zinc/Slate, tipografi *Inter* & *Plus Jakarta Sans*.
* **Flush Sticky Navbar (Backdrop Blur)**: Navigasi publik yang *sticky* menempel di bagian paling atas layar dengan efek buram transparan ala macOS/iOS (*glassmorphism*).
* **Single Language (Bahasa Indonesia)**: Penulisan dan penyajian konten difokuskan pada 1 bahasa utama agar cepat, ringan, dan efisien.
* **Fitur Dark & Light Mode**: Switcher tema terang/gelap dengan kontras tinggi yang tersimpan otomatis di `localStorage`.
* **Formulir Kontak Publik & Keamanan**:
  * **Visual Math Captcha**: Verifikasi acak matematika untuk pengunjung manusia.
  * **Honeypot Anti-Bot**: Bidang tersembunyi untuk memblokir bot spam secara otomatis.
  * **Rate Limiting & Anti-XSS**: Pembatasan 5 pengiriman pesan per jam per IP & sanitasi HTML.

### 🛡️ 2. Panel Admin CMS (`/admin`)
* **Identitas & Brand Logo Dinamis**: Nama brand/logo (`site_title`) dan nama pemilik website (`site_owner_name`) dapat diubah kapan saja secara dinamis via Admin Settings.
* **Sticky Admin Sidebar & Mobile Drawer**: Sidebar navigasi yang *sticky* di PC dan berubah menjadi laci navigasi responsif (*Mobile Drawer ☰*) di HP.
* **Google OAuth 2.0 SSO (Single Sign-On)**: Tombol *"Pilih & Login dengan Akun Google"* dengan opsi *Account Chooser* (`prompt: select_account`) yang terkunci aman khusus email admin terdaftar.
* **TipTap Rich Text Editor**: Penulisan artikel blog profesional sekelas WordPress/Notion (Embed Gambar di Tengah Paragraf, Headings H1-H3, Code Block Syntax Highlighting, Blockquotes, Link, Undo/Redo).
* **Security Audit Log Trail (`/admin/logs`)**: Mencatat secara transparan seluruh riwayat login (Waktu, IP Address, Device/Browser, Status Sukses/Gagal).
* **Profil Saya & Keamanan Password**: Mengubah nama akun, email login, dan ganti password dengan hashing Bcrypt.
* **Pengaturan Server SMTP & Tes Email**: Konfigurasi SMTP Host, Port, Username, Password, dan tombol **`🧪 Kirim Tes Email Notifikasi`** langsung dari UI Admin.
* **Tabel Data Responsif**: Seluruh tabel data postingan, proyek, pengalaman, dan logs dibungkus dengan scroll horizontal mulus (`overflow-x-auto`) untuk layar smartphone.

---

## 🛠️ Stack Teknologi

* **Database**: MariaDB / MySQL 8.0 (Database: `personal_portfolio_db`).
* **Backend Runtime**: Node.js (`v24.18.0`).
* **Backend Framework**: Express.js (REST API).
* **Database Driver**: `mysql2` dengan Connection Pooling.
* **Frontend Web**: React 19 + Vite.
* **Styling**: Tailwind CSS v4 (`@custom-variant dark`) + Lucide React Icons.
* **Editor**: TipTap Editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`).
* **Otentikasi & Keamanan**: JWT + Bcrypt + Google OAuth 2.0 (`@react-oauth/google` & `google-auth-library`) + Helmet + Express Rate Limit + Sanitize HTML.
* **Email Service**: Nodemailer (SMTP Dynamic Config).

---

## 📂 Struktur Repositori

```text
personal/
├── client/                     # Frontend React + Vite
│   ├── src/
│   │   ├── admin/              # Panel Admin CMS (Dashboard, Posts, Projects, Logs, Profile, Settings)
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── components/         # Navbar, Footer, RichTextEditor
│   │   ├── context/            # AuthContext, ThemeContext, LanguageContext
│   │   └── pages/              # Home, About, Blog, BlogPost, Portfolio, Contact
│   ├── .env                    # Client environment variables (VITE_GOOGLE_CLIENT_ID)
│   └── package.json
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # Connection pool MariaDB
│   │   ├── controllers/        # Auth, Posts, Projects, Experiences, Messages, Settings, Logs
│   │   ├── database/           # Schema SQL, Seeder, & Migrations
│   │   ├── middleware/         # Auth JWT, Rate Limiters, Error Handlers
│   │   ├── routes/             # Public, Auth, & Admin REST API Routes
│   │   └── utils/              # Response Helpers & Mailer Nodemailer
│   ├── .env                    # Server environment variables (DB, JWT, Google OAuth, SMTP)
│   └── package.json
├── deployment-guide.md         # Panduan Deployment Nginx, PM2, MariaDB, SSL
└── README.md                   # Dokumentasi Utama Proyek
```

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
* Laragon / MySQL 8.0 running di port `3306`.
* Node.js (`>= 18.x`).

### 2. Jalankan Backend Server
```bash
cd server
npm install
npm run seed   # Menginisialisasi database personal_portfolio_db & seeder awal
npm run dev    # Server berjalan di http://localhost:5000
```

### 3. Jalankan Frontend React Client
```bash
cd client
npm install
npm run dev    # Client berjalan di http://127.0.0.1:5173
```

---

## 🔑 Akses Default Administrator

* **URL Login**: `http://127.0.0.1:5173/admin/login`
* **Email**: `admin@teguh.co` (Dapat diubah via menu *Profil Saya*)
* **Password**: `AdminSecret123!` (Dapat diubah via menu *Profil Saya*)
* **Google SSO Login**: Klik tombol *"Pilih & Login dengan Akun Google"*

---

## 📄 Lisensi

Di bawah lisensi [MIT License](LICENSE).
