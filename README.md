# 🚀 Teguh Pratama — Personal Website & Admin Panel CMS (MARN Stack)

Web portofolio & blog dinamis untuk **Teguh Pratama** (*Software Engineer & Systems Architect*) dengan fitur **Panel Admin CMS**, **Multi-Language (ID/EN)**, dan **Dark Mode**, dibangun menggunakan **MARN Stack** (*MariaDB + Express.js + React + Node.js*).

---

## 🏗️ Struktur Proyek

Proyek ini terbagi menjadi dua direktori utama:

* **`server/`**: Backend Express.js REST API, Otentikasi JWT, Security Middlewares, dan Koneksi MariaDB/MySQL.
* **`client/`**: Frontend React 19 (Vite + Tailwind CSS) untuk Antarmuka Publik & Panel Admin CMS (`/admin`).

---

## ⚡ Panduan Menjalankan Proyek (Lokal)

### 1. Prasyarat System
* **Laragon** (MySQL/MariaDB berjalan di port `3306`).
* **Node.js**: Versi `v18+` (npm `v9+`).

### 2. Setup & Jalankan Backend (`server/`)
```bash
cd server
npm install
npm run seed   # Menginisialisasi tabel database teguh_portfolio_db & data seeder awal
npm run dev    # Menjalankan Express API server di http://localhost:5000
```

### 3. Setup & Jalankan Frontend (`client/`)
```bash
cd client
npm install
npm run dev    # Menjalankan Vite React dev server di http://127.0.0.1:5173
```

---

## 🔑 Kredensial Akses Panel Admin

* **URL Panel Admin**: `http://127.0.0.1:5173/admin/login`
* **Email**: `admin@teguh.co`
* **Password**: `AdminSecret123!`

---

## 📄 Dokumentasi Rencana & Walkthrough
* [Panduan Deployment Produksi](deployment-guide.md)
* [Rencana Implementasi PRD](docs/implementation_plan.md)
* [Laporan Walkthrough](file:///C:/Users/isstaf34/.gemini/antigravity-ide/brain/61ec8dea-f5ff-4137-9f2b-4804b553a7ff/walkthrough.md)
