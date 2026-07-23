# 🌐 Panduan Deployment (Deployment Guide) — Teguh Pratama MARN Stack

Dokumen ini berisi panduan langkah demi langkah untuk melakukan *deployment* (penyebaran) aplikasi web dinamis Teguh Pratama dari lingkungan pengembangan lokal (*development*) ke lingkungan produksi (*production server / VPS / Laragon Server*).

---

## 📋 Prasyarat Server Produksi (Production Prerequisites)

Sebelum memulai deployment, pastikan server Anda (VPS Ubuntu/Debian atau Windows Server) telah memiliki paket berikut:

1. **Node.js**: Versi `v18.x` atau lebih baru.
2. **MariaDB / MySQL**: Versi `8.0+` (Aktif dan dapat diakses).
3. **PM2 Process Manager**: Untuk menjaga server Node.js Express tetap berjalan di latar belakang (auto-restart saat crash/reboot).
4. **Nginx atau Apache**: Sebagai *Reverse Proxy* dan penyaji berkas statis React.
5. **SSL Certificate (Certbot)**: Untuk mengaktifkan protokol HTTPS yang aman.

---

## 🛠️ Langkah 1: Persiapan Database MariaDB di Server

1. **Masuk ke MySQL/MariaDB Server**:
   ```bash
   sudo mysql -u root -p
   ```

2. **Buat Database & Pengguna Produksi**:
   ```sql
   CREATE DATABASE teguh_portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'teguh_user'@'localhost' IDENTIFIED BY 'PasswordSangatRahas1a!';
   GRANT ALL PRIVILEGES ON teguh_portfolio_db.* TO 'teguh_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Inisialisasi Tabel & Seeder Awal**:
   Jalankan skrip seeder dari folder backend (Langkah 2) untuk membentuk struktur tabel otomatis.

---

## ⚙️ Langkah 2: Deployment Backend Express.js Server (`server/`)

1. **Clone Repositori ke Server**:
   ```bash
   cd /var/www
   git clone https://github.com/zainaldocs/personal.git
   cd personal/server
   ```

2. **Instal Dependensi Backend**:
   ```bash
   npm install --production
   ```

3. **Konfigurasi Berkas `.env` Produksi**:
   Buat berkas `.env` di folder `server/`:
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=teguh_user
   DB_PASSWORD=PasswordSangatRahas1a!
   DB_NAME=teguh_portfolio_db
   JWT_SECRET=Ganti_Dengan_Random_Secret_Key_Yang_Sangat_Panjang_2026
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=https://teguh.co,https://www.teguh.co
   ```

4. **Jalankan Seeder Database**:
   ```bash
   npm run seed
   ```

5. **Jalankan Backend Server dengan PM2**:
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name "teguh-backend"
   pm2 save
   pm2 startup
   ```
   *Backend API kini berjalan stabil di `http://127.0.0.1:5000`.*

---

## 💻 Langkah 3: Build & Deployment Frontend React (`client/`)

1. **Masuk ke Folder Client & Instal Dependensi**:
   ```bash
   cd /var/www/personal/client
   npm install
   ```

2. **Sesuaikan URL API Backend (Jika Perlu)**:
   Pastikan `src/api/axios.js` mengarah ke domain/URL produksi, contoh: `/api` atau `https://teguh.co/api`.

3. **Lakukan Build Produksi**:
   ```bash
   npm run build
   ```
   *Hasil kompilasi file statis produksi yang sangat cepat akan dihasilkan di folder `client/dist/`.*

---

## 🔀 Langkah 4: Konfigurasi Reverse Proxy Nginx (Rekomendasi VPS)

Buat berkas konfigurasi Nginx baru untuk menyatukan Frontend React dan Backend Express di satu domain tanpa nomor port:

```bash
sudo nano /etc/nginx/sites-available/teguh.co
```

Isikan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name teguh.co www.teguh.co;

    # Root folder hasil build React
    root /var/www/personal/client/dist;
    index index.html;

    # 1. Routing Frontend React (SPA Support)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Reverse Proxy ke Backend Express API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan muat ulang Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/teguh.co /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Langkah 5: Pasang Sertifikat SSL HTTPS Gratis (Certbot)

Amankan domain Anda dengan HTTPS:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d teguh.co -d www.teguh.co
```

*Certbot akan mengonfigurasi SSL HTTPS otomatis dan memperbarui sertifikat secara berkala.*

---

## 🏠 Opsi Deployment Lokal di Laragon (Windows Server)

Jika Anda ingin menyajikan web ini secara produksi di server lokal **Laragon**:

1. **Jalankan Backend Server** via PM2 atau CMD (`cd server && npm start`).
2. **Buat file `.htaccess`** di `c:\laragon\www\personal\.htaccess`:
   ```apache
   RewriteEngine On
   
   # Direct API requests to Express
   RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
   ```
3. Aktifkan **Auto Virtual Host** di Laragon untuk mengakses via `http://personal.test`.

---

## ✅ Verifikasi Akhir Produksi

1. Buka `https://teguh.co` -> Pastikan halaman publik render dinamis.
2. Buka `https://teguh.co/admin/login` -> Login dengan kredensial admin.
3. Uji coba pengisian artikel/proyek baru dan kirim pesan di form kontak.
