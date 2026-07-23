# Rangkuman Rencana Implementasi: Web Dinamis Teguh Pratama

Dokumen Rencana Arsitektur, UI/UX, serta **Kaidah Standar Pemrograman & Keamanan** untuk Web Dinamis Teguh Pratama menggunakan **MARN Stack** (*MariaDB/MySQL + Express.js + React + Node.js*).

---

## 🛡️ 1. Kaidah Standar Pemrograman & Keamanan (Best Practices & Security)

### **A. Prinsip Best Practice & Clean Code (DRY & SOLID)**
1. **DRY (Don't Repeat Yourself)**:
   * **Backend**: Pembuatan middleware terpusat untuk penanganan error (*Centralized Error Handler*), fungsi utilitas pembentuk respons JSON standar (`successResponse`, `errorResponse`), dan fungsi pembuat token JWT reusable.
   * **Frontend**: Penggunaan *Custom Hooks* React (seperti `useAuth`, `useFetch`, `useDarkMode`) dan komponen UI atomik yang reusable (*Button*, *Card*, *Input*, *Badge*, *Modal*).
2. **Prinsip SOLID**:
   * **Single Responsibility Principle (SRP)**: Pemisahan peran yang tegas antara **Route** (penentu URL), **Controller** (penangan request/response), **Service/Repository** (logika bisnis & query database), serta **Middleware** (validasi & autentikasi).
   * **Open/Closed Principle (OCP)**: Komponen UI dan middleware dibuat fleksibel untuk dikembangkan tanpa perlu merombak struktur utama.
3. **Konvensi Penulisan Kode**:
   * **JavaScript/TypeScript**: Format `camelCase` untuk variabel & fungsi (`getPostBySlug`), `PascalCase` untuk komponen React (`ProjectCard`).
   * **Database**: Format `snake_case` untuk nama kolom tabel database (`created_at`, `is_published`).
   * Tulis kode yang *self-documenting* (jelas dan mudah dibaca) disertai komentar bermakna pada logika bisnis yang kompleks.

---

### **B. Logika Kontrol Flow & Error Handling**
1. **Validasi Input Ketat**:
   * Semua data masuk dari pengguna (request body/query/params) **wajib divalidasi** menggunakan pustaka validasi (*express-validator* / *zod*) sebelum diproses oleh database.
2. **Handling Asinkronus & Try-Catch**:
   * Semua *async database calls* dibungkus dengan blok `try-catch` atau *async wrapper function* untuk mencegah server *crash* saat terjadi kegagalan tak terduga.
3. **Penanganan Graceful Failure**:
   * Jika artikel atau proyek tidak ditemukan, sistem mengembalikan status HTTP yang tepat (`404 Not Found`) dengan format JSON terstruktur, bukan membiarkan request menggantung.

---

### **C. Standar Keamanan Sistem (Security Best Practices)**
1. **Pencegahan SQL Injection**:
   * Semua eksekusi query ke MariaDB/MySQL **wajib menggunakan *Prepared Statements / Parameterized Queries*** (via ORM atau `mysql2`), tidak boleh menggunakan penggabungan string murni (`string concatenation`).
2. **Otentikasi & Password Security**:
   * Pengisian password admin dikunci menggunakan dekripsi satu arah **Bcrypt (Salting >= 10 rounds)**.
   * Sesi login dilindungi token **JWT (JSON Web Token)** yang memiliki masa kadaluarsa (*expiration time*) dan diverifikasi oleh *Auth Middleware* pada setiap *protected endpoint*.
3. **Pencegahan XSS (Cross-Site Scripting)**:
   * Konten rich text / HTML dari editor artikel **wajib disanitasi** di backend/frontend (menggunakan *DOMPurify* / *sanitize-html*) sebelum ditampilkan ke publik.
4. **Pencegahan Brute-Force & Spam**:
   * Menerapkan **Rate Limiting** (pustaka `express-rate-limit`) khusus pada endpoint `POST /api/auth/login` (maksimal 5x percobaan salah per menit) dan form kontak `POST /api/contact` untuk memblokir bot spam.
5. **Security Headers & CORS**:
   * Menggunakan pustaka **Helmet.js** untuk mengamankan HTTP response headers.
   * Mengonfigurasi **CORS (Cross-Origin Resource Sharing)** hanya untuk domain/origin yang terotorisasi.
6. **Perlindungan Kredensial (Environment Variables)**:
   * Semua data sensitif (Password DB, Secret Key JWT, Port Server) disimpan di berkas `.env` dan didaftarkan pada `.gitignore` agar tidak bocor ke repositori Git.

---

## 🎨 2. Desain UI & Estetika Antarmuka

### **A. Antarmuka Publik (Public Viewers)**
* **Tema Warna**: Palet Netral Sleek (Zinc/Slate) dengan kontras tinggi di Light Mode (`#FAFAFA`) & Dark Mode (`#09090B`).
* **Tipografi**: *Plus Jakarta Sans*, *Inter*, *JetBrains Mono*.
* **Komponen React Modular**: `Navbar`, `Footer`, `ProjectCard`, `ArticleCard`, `SearchFilterBar`, `ContactForm`.

---

### **B. Antarmuka Panel Admin (`/admin`)**
* **Sidebar Navigation**, **Tab Switcher Konten Bilingual (ID / EN)**, **Markdown / Rich Text Editor**, **Toast Notifications**, **Data Tables Interaktif**.

---

## 🏗️ 3. Fixed Tech Stack & Infrastruktur

* **Database**: MariaDB / MySQL 8.0 (Laragon).
* **Backend Runtime**: Node.js (`v24.18.0`).
* **Backend Framework**: Express.js (REST API).
* **Database ORM/Query**: Prisma ORM / `mysql2` (dengan dukungan JSON).
* **Frontend Public & Admin Panel**: React.js (Vite + React Router + Tailwind CSS).
* **Keamanan / Auth**: JWT + Bcrypt + Helmet + Express Rate Limit + Sanitize HTML.

---

## 🗄️ 4. Skema Database (MariaDB / MySQL)

Tabel: `users`, `site_settings`, `posts`, `projects`, `experiences`, `messages`.

---

## 🚀 5. Tahapan Eksekusi

1. **Tahap 1**: Setup Server Backend Express.js & MariaDB Laragon + Security Middleware.
2. **Tahap 2**: Buat Skema DB & Seeder Initial Data.
3. **Tahap 3**: Buat REST API (Clean Architecture & SOLID) + Proteksi JWT Admin.
4. **Tahap 4**: Pembuatan Frontend React Publik (Refaktor Halaman Statis ke React Component).
5. **Tahap 5**: Pembuatan Frontend Panel Admin React (`/admin` Dashboard & CRUD Forms).
6. **Tahap 6**: Integration Test, Security Audit, & Final Verification.
