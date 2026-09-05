# 👟 ShoesPicker — Tinder for Shoes (Sortir Sepatu Impian)

Aplikasi web interaktif **Mobile-First** untuk menyortir dan memilih sepatu dengan mekanisme gestur **Swipe ala Tinder** antara status **"Masih Dipakai"** ✨ dan **"Tidak Dipakai"** 📦. 

Dilengkapi fitur **Upload Foto Sepatu** (dari kamera HP/galeri) serta **Sinkronisasi Cloud Supabase** agar data sepatu yang Anda tambahkan dapat dilihat dan disortir bersama oleh keluarga/kakak dari perangkat berbeda secara *real-time*.

---

## 🌟 Fitur Unggulan

- 🎴 **Tinder Swipe Gestures (`framer-motion`)**:
  - **Geser ke Kanan** / Tombol Hijau: Status **"Masih Dipakai"** ✨ dengan animasi stamp hijau emerald.
  - **Geser ke Kiri** / Tombol Merah: Status **"Tidak Dipakai"** 📦 dengan animasi stamp merah rose.
  - **Tumpukan 3D Card Stack**: Memberikan kedalaman visual antar kartu sepatu.
  - **Undo Button**: Kembalikan pilihan swipe sebelumnya jika berubah pikiran.
  - **Keyboard Support**: Navigasi panah `⬅️` (Tidak Dipakai) dan `➡️` (Masih Dipakai), `Z` (Undo).
  - **Celebration Confetti**: Efek kembang api selebrasi saat semua sepatu telah selesai disortir!

- 📸 **Upload Foto Sepatu**:
  - Dukungan langsung dari **Kamera Smartphone** atau Galeri foto.
  - Kompresi gambar otomatis di sisi browser (WebP) sehingga hemat kuota dan super cepat.
  - Form input: Nama, Brand (Nike, Adidas, New Balance, Converse, Vans, dll.), Kategori, dan Catatan Kondisi.
  - Langsung masuk ke kartu swipe antrean teratas.

- 📋 **Daftar & Status Koleksi**:
  - Filter tab: *Semua*, *Masih Dipakai*, *Tidak Dipakai*, dan *Belum Disortir*.
  - Kolom pencarian instan (nama sepatu, brand, kategori).
  - Ganti status cepat (*one-click status switcher*).
  - Hapus atau ulangi sortir kapan saja.

- ☁️ **Sinkronisasi Bersama (Supabase Cloud)**:
  - **Multi-device / Shared Closet**: Anda upload di HP Anda, Kakak Anda langsung melihatnya di HP miliknya!
  - **Storage Bucket (`shoe-images`)**: Foto sepatu tersimpan aman di cloud.
  - **Smart Fallback**: Langsung berfungsi di lokal (*Demo Mode*) tanpa perlu konfigurasi awal, dan bisa langsung dihubungkan ke Supabase lewat menu pengaturan di aplikasi atau via file `.env`.

- 🚀 **100% Siap Deploy ke Vercel**:
  - Disertai `vercel.json` rewrite routing untuk Single Page App.
  - Chunk bundle teroptimasi dan super ringan di jaringan smartphone.

---

## 🚀 Cara Menjalankan di Lokal

1. Pastikan Anda memiliki Node.js terpasang di komputer.
2. Buka terminal di folder project ini:
   ```bash
   npm install
   npm run dev
   ```
3. Buka browser di `http://localhost:3000`.

---

## ☁️ Menghubungkan ke Supabase (Akses Bersama Anda & Kakak)

Agar sepatu yang Anda daftarkan bisa langsung dilihat oleh kakak Anda dari HP-nya:

1. Buat proyek baru gratis di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan script yang ada di file `supabase_schema.sql`.
3. Buka menu **Settings > API** di Supabase untuk mendapatkan:
   - `Project URL`
   - `anon public key`
4. Anda punya 2 cara mudah untuk menghubungkannya:
   - **Cara 1 (Langsung dari Web UI)**: Buka web ShoesPicker, klik tombol status **"Lokal Demo"** di pojok kanan atas, lalu masukkan Project URL dan Anon Key Anda. Selesai!
   - **Cara 2 (File .env)**: Buat file `.env` di folder proyek ini (berdasarkan `.env.example`):
     ```env
     VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
     ```

---

## 🌐 Cara Deploy ke Vercel

1. Push folder proyek ini ke repository GitHub Anda (misal `github.com/username/shoespicker`).
2. Masuk ke [vercel.com](https://vercel.com) dan klik **"Add New Project"**.
3. Import repository GitHub Anda.
4. Pada bagian **Environment Variables** di Vercel (opsional jika menggunakan Supabase):
   - Masukkan `VITE_SUPABASE_URL`
   - Masukkan `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**! Web Anda langsung aktif dan dapat diakses dari smartphone Anda dan kakak Anda.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Cloud Database & Storage**: Supabase (PostgreSQL + Storage Bucket)
- **Deployment**: Vercel
