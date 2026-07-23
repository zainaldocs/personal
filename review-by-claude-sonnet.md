# 🔍 Code Review Report — Personal Portfolio CMS (MARN Stack)
**Reviewer**: Claude Sonnet (AI Code Reviewer)  
**Tanggal Review**: 23 Juli 2026  
**Codebase**: `c:/laragon/www/personal` — Full-stack MARN (MariaDB + Express.js + React + Node.js)  
**Ruang Lingkup**: Kualitas Kode, Alur Logika, & Keamanan (Security)

---

## Ringkasan Eksekutif

Secara keseluruhan codebase ini **cukup solid** untuk sebuah proyek personal/portofolio. Struktur folder bersih, pemisahan tanggung jawab (Controller-Route-Middleware) sudah diterapkan dengan baik, dan fitur-fitur keamanan dasar sudah ada. Namun, ditemukan sejumlah **temuan kritis dan non-kritis** yang perlu diperbaiki sebelum naik ke production level.

**Status**: ⚠️ **PERLU PERBAIKAN SEBELUM PRODUCTION** — Mayoritas temuan berkaitan dengan keamanan kritis.

---

## 📊 Skor Review Per Kategori

| Kategori | Skor | Keterangan |
|---|---|---|
| Kualitas & Konsistensi Kode | 7/10 | Baik, ada beberapa duplikasi & sisa hardcode |
| Alur Logika Aplikasi | 8/10 | Logis dan jelas, ada 1-2 celah kecil |
| Keamanan (Security) | 5/10 | Ada temuan **KRITIS** yang harus diperbaiki |

---

## 🚨 TEMUAN KRITIS — WAJIB DIPERBAIKI

### [CRITICAL-1] JWT Secret Key Hardcoded dengan Nilai Default Mengandung Nama Pribadi
**File**: 
- `server/src/controllers/authController.js` (baris 49, 122, 176)
- `server/src/middleware/auth.js` (baris 12)

**Masalah**:
```javascript
// Muncul di 4 tempat berbeda (pelanggaran DRY)
process.env.JWT_SECRET || 'super_secret_teguh_pratama_jwt_key_2026_secure'
```

**Dampak**:
1. **Pelanggaran DRY** — Fallback string yang sama diulang di 4 file berbeda. Jika ingin mengubah fallback, harus mengubah di 4 tempat.
2. **Keamanan** — Fallback default JWT secret ini mengandung nama pribadi dan akan digunakan jika `JWT_SECRET` di `.env` tidak diatur. Untuk production, jika `.env` hilang atau tidak ter-load, aplikasi tetap berjalan dengan secret yang mudah ditebak.
3. **Sisa hardcode nama lama** — String `'super_secret_teguh_pratama_jwt_key_2026_secure'` masih menyebut `teguh_pratama`, bertentangan dengan refactoring nama brand yang sudah dilakukan.

**Solusi**:
```javascript
// server/src/config/jwt.js — buat file konfigurasi terpusat
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Dalam production: crash aplikasi jika secret tidak ada
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is not set!');
    }
    // Development only fallback
    return 'dev_only_fallback_secret_not_for_production';
  }
  return secret;
};
module.exports = { getJwtSecret };
```
Kemudian import `getJwtSecret()` di semua tempat yang menggunakan JWT.

---

### [CRITICAL-2] Google Token Verification Memiliki Path Tidak Aman (Fallback Manual JWT Decode)
**File**: `server/src/controllers/authController.js` (baris 91–100)

**Masalah**:
```javascript
// KODE BERBAHAYA — Jika verifyIdToken gagal, token langsung di-decode manual TANPA VERIFIKASI SIGNATURE!
} catch (err) {
  const base64Url = credential.split('.')[1];
  // ...
  payload = JSON.parse(jsonPayload); // ← Token TIDAK diverifikasi
}
```

**Dampak**: Seorang penyerang bisa **memalsukan** token Google (JWT) dengan payload email admin yang valid, karena signature tidak diverifikasi di fallback path ini. Ini adalah **authentication bypass vulnerability** yang sangat serius.

**Solusi**: Hapus seluruh blok `catch` yang melakukan manual decode. Jika `verifyIdToken` gagal, harus langsung return error.
```javascript
// AMAN — Tidak ada fallback manual decode
if (credential) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return errorResponse(res, 'Google SSO tidak dikonfigurasi di server.', null, 503);
  }
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  email = payload.email;
  name = payload.name;
}
```

---

### [CRITICAL-3] API URL Frontend Hardcoded ke `localhost`
**File**: `client/src/api/axios.js` (baris 4)

**Masalah**:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ← HARDCODED! Akan gagal saat deploy
```

**Dampak**: Saat deploy ke server production (domain `https://yourdomain.com`), seluruh API call dari frontend akan tetap mencoba koneksi ke `http://localhost:5000/api` yang tidak ada di server production. Aplikasi **tidak akan berfungsi sama sekali** setelah deploy.

**Solusi**:
```javascript
// client/src/api/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
```
Dan tambahkan di `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Dan di `.env` production nanti:
```env
VITE_API_URL=https://yourdomain.com/api
```

---

### [CRITICAL-4] SMTP Password Disimpan Plaintext di Database
**File**: `server/src/utils/mailer.js`, `server/src/controllers/settingController.js`

**Masalah**: Password SMTP disimpan dalam kolom `value_id` (plaintext) di tabel `site_settings`. Jika database bocor (SQL injection, backup tidak terenkripsi, dll.), SMTP password langsung terbaca.

**Dampak**: Penyerang yang mendapat akses ke database akan langsung mendapat kredensial email SMTP.

**Solusi**:  
Untuk level produksi minimum, simpan SMTP credentials di `server/.env` saja (tidak perlu di DB). Jika tetap ingin di DB, enkripsi menggunakan `crypto` Node.js sebelum menyimpan:
```javascript
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY; // 32 byte hex

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  return iv.toString('hex') + ':' + Buffer.concat([cipher.update(text), cipher.final()]).toString('hex');
};

const decrypt = (text) => {
  const [ivHex, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ivHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]).toString();
};
```

---

## ⚠️ TEMUAN PENTING — SANGAT DISARANKAN DIPERBAIKI

### [IMPORTANT-1] `getSettings` Endpoint Publik Mengembalikan Konfigurasi SMTP
**File**: `server/src/controllers/settingController.js` (baris 5-19), `server/src/routes/publicRoutes.js` (baris 12)

**Masalah**:
```javascript
// Route ini bisa diakses siapa saja tanpa autentikasi
router.get('/settings', getSettings); // PUBLIC ROUTE!

// Controller ini mengambil SEMUA settings termasuk smtp_host, smtp_user, smtp_pass
const [rows] = await pool.query('SELECT setting_key, value_id, value_en FROM site_settings');
```

**Dampak**: Pengunjung biasa (bahkan bot) bisa mengakses `GET /api/public/settings` dan mendapatkan nilai `smtp_host`, `smtp_user`, dan `smtp_pass` (walaupun mungkin kosong, ini tetap tidak aman dari sisi desain).

**Solusi**: Filter key sensitif sebelum return ke public:
```javascript
const PRIVATE_KEYS = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'notification_email'];

const getSettings = async (req, res, next) => {
  const isAdmin = !!req.user; // check if request has auth token
  const [rows] = await pool.query('SELECT setting_key, value_id, value_en FROM site_settings');
  const settingsMap = {};
  rows.forEach(row => {
    if (!isAdmin && PRIVATE_KEYS.includes(row.setting_key)) return; // skip sensitive keys for public
    settingsMap[row.setting_key] = { id: row.value_id, en: row.value_en };
  });
  return successResponse(res, 'Pengaturan situs berhasil diambil.', settingsMap);
};
```

---

### [IMPORTANT-2] Pelanggaran DRY — Fungsi `generateSlug` Duplikat
**File**: 
- `server/src/controllers/postController.js` (baris 6-13)
- `server/src/controllers/projectController.js` (baris 4-11)

**Masalah**: Fungsi `generateSlug` yang identik ditulis dua kali di dua file controller yang berbeda.

**Solusi**: Pindahkan ke utility file terpusat:
```javascript
// server/src/utils/slugHelper.js
const generateSlug = (text) => {
  return text
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
module.exports = { generateSlug };
```
Kemudian import di kedua controller.

---

### [IMPORTANT-3] `getMessages` Tanpa Pagination — Potensi Memory Issue
**File**: `server/src/controllers/messageController.js` (baris 43-49)

**Masalah**:
```javascript
// Tidak ada LIMIT — mengambil SEMUA pesan sekaligus
const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
```

**Dampak**: Jika website berjalan lama dan ada ribuan pesan, query ini bisa menyebabkan memory spike di server dan response yang lambat.

**Solusi**: Tambahkan pagination sederhana:
```javascript
const getMessages = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = (page - 1) * limit;
  const [messages] = await pool.query(
    'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  // ...
};
```

---

### [IMPORTANT-4] Audit Logs Hard-limit 100 Record Tanpa Keterangan
**File**: `server/src/controllers/authController.js` (baris 229-234)

**Masalah**:
```javascript
SELECT al.* ... LIMIT 100
```
Hard-limit 100 tanpa pagination. Admin tidak bisa melihat log lebih dari 100 entri.

**Solusi**: Tambahkan pagination dan filter tanggal di endpoint ini.

---

### [IMPORTANT-5] IP Address Logging Bisa Tidak Akurat di Balik Proxy/Load Balancer
**File**: `server/src/controllers/authController.js` (baris 21, 67)

**Masalah**:
```javascript
const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
```

Urutan prioritas ini salah. `req.ip` di Express default mengembalikan IP proxy, bukan client IP asli. `x-forwarded-for` bisa berisi multiple IP (e.g., `"client, proxy1, proxy2"`) dan nilai pertamanya yang adalah IP asli.

**Solusi**:
```javascript
const ipAddress = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() 
  || req.ip 
  || req.socket.remoteAddress 
  || '0.0.0.0';
```
Dan jika deploy di balik Nginx, tambahkan di `app.js`:
```javascript
app.set('trust proxy', 1);
```

---

### [IMPORTANT-6] `updateSettings` Tidak Memvalidasi Key yang Diterima
**File**: `server/src/controllers/settingController.js` (baris 22-47)

**Masalah**: `updateSettings` menerima objek `settings` tanpa memvalidasi key mana yang boleh diperbarui. Secara teori, penyerang yang berhasil mendapat token admin bisa menyuntikkan key-value sembarang ke tabel `site_settings`.

**Solusi**: Whitelist key yang boleh diperbarui:
```javascript
const ALLOWED_SETTING_KEYS = [
  'site_title', 'site_owner_name', 'hero_status', 'hero_title', 'hero_desc',
  'contact_email', 'social_github', 'social_twitter', 'social_linkedin',
  'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'notification_email'
];

// Di dalam updateSettings:
const filteredItems = items.filter(item => ALLOWED_SETTING_KEYS.includes(item.key));
if (filteredItems.length !== items.length) {
  return errorResponse(res, 'Terdapat setting key yang tidak diizinkan.', null, 400);
}
```

---

## 📝 TEMUAN MINOR — DISARANKAN DIPERBAIKI

### [MINOR-1] Sisa Hardcode Nama Lama di Beberapa File
**File**:
- `server/src/utils/mailer.js` (baris 16, 47, 64, 75, 96, 98, 102): Masih ada referensi `"Teguh.co"` dan `'admin@teguh.co'`
- `server/src/config/db.js` (baris 11): Default DB name masih `'teguh_portfolio_db'` (tidak konsisten dengan `personal_portfolio_db` di `.env`)
- `server/src/database/seed.js` (baris 117, 122, 124): Seeder masih membuat admin dengan email `'admin@teguh.co'`

**Dampak**: Inkonsistensi yang akan membingungkan developer lain.

**Solusi**: Ganti semua sisa `teguh.co` dan `teguh_portfolio_db` dengan nilai netral/generik, atau baca dari environment variable.

---

### [MINOR-2] Tidak Ada Response Interceptor di Axios Client — Silent Token Expiry
**File**: `client/src/api/axios.js`

**Masalah**: Tidak ada response interceptor untuk menangani HTTP 401 (token expired). Saat token admin kedaluwarsa (setelah 1 hari), API call akan gagal dengan error tidak informatif dan user tidak otomatis di-logout/redirect ke halaman login.

**Solusi**:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

---

### [MINOR-3] Email Validation di Backend Hanya Menggunakan `sanitize-html`
**File**: `server/src/controllers/messageController.js` (baris 19-22)

**Masalah**: `sanitizeHtml(email)` tidak memvalidasi format email yang benar. Seseorang bisa mengirim `email: "bukan-email"` dan akan tersimpan di database.

**Solusi**: Tambahkan validasi format email:
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return errorResponse(res, 'Format email tidak valid.', null, 400);
}
```

---

### [MINOR-4] Password Minimum 6 Karakter Terlalu Lemah
**File**: `server/src/controllers/authController.js` (baris 200), `client/src/admin/AdminProfile.jsx` (baris 57)

**Masalah**: Untuk akun admin, minimum 6 karakter sangat lemah. Standar industry minimum adalah 8-12 karakter dengan kompleksitas (huruf besar, angka, simbol).

**Solusi**: Naikkan ke minimal 8 karakter dan tambahkan validasi kompleksitas:
```javascript
if (newPassword.length < 8) {
  return errorResponse(res, 'Password baru minimal harus 8 karakter.', null, 400);
}
const hasUppercase = /[A-Z]/.test(newPassword);
const hasNumber = /[0-9]/.test(newPassword);
if (!hasUppercase || !hasNumber) {
  return errorResponse(res, 'Password harus mengandung huruf kapital dan angka.', null, 400);
}
```

---

### [MINOR-5] `AdminSettings.jsx` Memanggil `window.location.reload()` Setelah Save
**File**: `client/src/admin/AdminSettings.jsx` (baris ~78)

**Masalah**: `window.location.reload()` setelah save settings adalah cara yang kasar (brute-force). Menyebabkan semua state hilang, loading ulang seluruh halaman, dan pengalaman pengguna yang tidak mulus.

**Solusi**: Gunakan React state management atau Context untuk update brand title secara reaktif tanpa reload halaman penuh. Atau minimal, tambahkan delay dan konfirmasi visual terlebih dahulu sebelum reload.

---

### [MINOR-6] `getPostBySlug` Mengembalikan Konten HTML Tanpa Filter ke Public
**File**: `server/src/controllers/postController.js` (baris 47-59)

**Masalah**: `SELECT *` di `getPostBySlug` mengembalikan `content_id` dan `content_en` yang berisi HTML dari TipTap Editor. Walaupun sudah di-sanitize saat simpan, konsistensi selalu `SELECT *` membuka risiko jika ada field sensitif yang ditambahkan di masa depan.

**Rekomendasi**: Biasakan gunakan explicit column selection daripada `SELECT *` untuk endpoint public.

---

### [MINOR-7] Math Captcha Sepenuhnya Client-Side — Bisa Dibypass
**File**: `client/src/pages/Contact.jsx`

**Masalah**: Verifikasi jawaban Math Captcha hanya dilakukan di JavaScript frontend. Penyerang bisa langsung memanggil `POST /api/public/contact` menggunakan cURL/Postman tanpa melewati halaman frontend sama sekali, sehingga captcha tidak berguna untuk bot yang lebih canggih.

**Dampak**: Perlindungan tambahan terhadap bot otomatis masih ada (rate limiter + honeypot di server), tapi captcha secara teknis tidak memberikan proteksi tambahan di level server.

**Solusi untuk produksi**: Pertimbangkan mengintegrasikan **Cloudflare Turnstile** (gratis) yang memiliki verifikasi server-side, atau kirimkan jawaban captcha ke server untuk divalidasi bersama form submission.

---

## ✅ HAL-HAL YANG SUDAH BAIK

1. **Struktur Controller-Route-Middleware**: Pemisahan tanggung jawab yang jelas dan konsisten di seluruh backend.
2. **Standardized API Response** (`successResponse` / `errorResponse`): Konsistensi format response yang baik — mudah di-consume oleh frontend.
3. **Parameterized Queries**: Seluruh query SQL menggunakan parameterized query (`?` placeholders) — aman dari SQL Injection.
4. **Bcrypt Password Hashing**: Password di-hash dengan salt factor 10, sudah cukup untuk production.
5. **Rate Limiting**: Login (5 percobaan/15 menit) dan Contact Form (5 pesan/jam) sudah terpasang.
6. **Helmet.js**: Security headers HTTP standar sudah aktif.
7. **Connection Pooling**: MariaDB Connection Pool dikonfigurasi dengan benar (limit: 10).
8. **XSS Sanitization**: `sanitize-html` digunakan saat menyimpan konten HTML dari TipTap editor dan pesan kontak.
9. **Honeypot Anti-Bot**: Implementasi honeypot field yang benar dan tidak mengganggu pengguna asli.
10. **Google OAuth Account Chooser**: `prompt: 'select_account'` sudah diimplementasikan dengan benar.
11. **Audit Log Trail**: Pencatatan aktivitas login dengan IP dan User-Agent yang komprehensif.
12. **ThemeContext Dark Mode**: Implementasi dark mode dengan Tailwind CSS v4 `@custom-variant` sudah benar.
13. **JWT Token di Authorization Header**: Token dikirim melalui `Authorization: Bearer` header, bukan cookie atau query string.
14. **Global Error Handler**: Centralized error handler dengan stack trace hanya tampil di development mode.

---

## 📋 Prioritas Perbaikan

| Prioritas | ID | Deskripsi | Effort |
|---|---|---|---|
| 🔴 CRITICAL | CRITICAL-1 | Sentralisasi JWT Secret & hapus hardcode fallback | Rendah |
| 🔴 CRITICAL | CRITICAL-2 | Hapus fallback manual JWT decode di Google Auth | Sangat Rendah |
| 🔴 CRITICAL | CRITICAL-3 | Gunakan `VITE_API_URL` env var di Axios client | Sangat Rendah |
| 🔴 CRITICAL | CRITICAL-4 | Jangan simpan SMTP password di DB plaintext | Sedang |
| 🟠 IMPORTANT | IMPORTANT-1 | Filter SMTP keys dari public settings endpoint | Rendah |
| 🟠 IMPORTANT | IMPORTANT-2 | Deduplikasi fungsi `generateSlug` ke utility | Rendah |
| 🟠 IMPORTANT | IMPORTANT-3 | Tambah pagination di `getMessages` | Rendah |
| 🟠 IMPORTANT | IMPORTANT-5 | Perbaiki parsing IP Address | Rendah |
| 🟠 IMPORTANT | IMPORTANT-6 | Whitelist key di `updateSettings` | Rendah |
| 🟡 MINOR | MINOR-2 | Tambah Axios response interceptor untuk 401 | Rendah |
| 🟡 MINOR | MINOR-1 | Bersihkan sisa hardcode nama lama | Rendah |
| 🟡 MINOR | MINOR-3 | Validasi format email di backend | Sangat Rendah |
| 🟡 MINOR | MINOR-4 | Perkuat validasi password minimum | Sangat Rendah |
| 🟡 MINOR | MINOR-5 | Ganti `window.location.reload()` dengan state update | Sedang |
| 🟡 MINOR | MINOR-7 | Captcha server-side validation | Tinggi |

---

*Laporan ini dibuat untuk keperluan perbaikan kode sebelum deployment production. Fokuskan perbaikan pada temuan CRITICAL dan IMPORTANT terlebih dahulu.*
