# 🚀 Client & Admin CMS Frontend (React + Vite + Tailwind CSS v4)

Antarmuka web publik dan **Panel Admin CMS** dinamis untuk situs portofolio dan blog pribadi, dibangun menggunakan **React 19**, **Vite**, **Tailwind CSS v4**, **TipTap Rich Text Editor**, dan **Google OAuth 2.0 SSO**.

---

## 🎨 Fitur Frontend

1. **Flush Sticky Navbar**: Header navigasi publik yang *sticky* menempel di 0px atas layar dengan efek buram *backdrop blur* (*glassmorphism*).
2. **Identitas & Brand Logo Dinamis**: Logo brand (`site_title`) dan nama pemilik (`site_owner_name`) dibaca secara dinamis dari API settings.
3. **TipTap Rich Text Editor**: Editor artikel blog profesional (Embed Gambar di Tengah Paragraf, Bold, Italic, Headings H1-H3, Blockquote, Code block, Undo/Redo).
4. **Google OAuth 2.0 SSO**: Tombol login Google dengan prompt *Account Chooser* (`prompt: select_account`).
5. **Security Audit Log Trail**: Halaman `/admin/logs` untuk memantau riwayat login & alamat IP pengakses.
6. **Form Kontak & Visual Math Captcha**: Form kontak publik dengan tantangan matematika acak & honeypot anti-bot.
7. **Pengaturan Server SMTP & Test Email**: Pengaturan SMTP Mailer & tombol tes pengiriman email langsung dari UI Admin.
8. **Mobile UI/UX Responsif**: Sidebar *Mobile Drawer ☰* di Admin Panel & tabel data dengan scroll horizontal (`overflow-x-auto`).

---

## 🛠️ Perintah Utama

```bash
# Menginstal dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Uji coba build produksi
npm run build
```
