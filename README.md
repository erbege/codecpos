# CodecPOS - Sistem Kasir (POS) Profesional & Modern

CodecPOS adalah aplikasi Point of Sale (POS) mutakhir yang dirancang khusus untuk toko sepeda dan bisnis ritel modern. Dibangun dengan kombinasi teknologi **Laravel 11**, **React**, dan **Inertia.js**, CodecPOS menawarkan pengalaman pengguna yang sangat cepat, estetis, dan kaya fitur.

![Screenshots Placeholder](https://via.placeholder.com/1200x600?text=CodecPOS+Interface+Preview)

## ✨ Fitur Utama

- **🛒 Kasir (POS) Responsif**: Antarmuka penjualan yang cepat dengan dukungan pemindaian barcode dan pengelolaan keranjang instan.
- **📦 Manajemen Inventori**:
    - Pelacakan stok secara real-time.
    - Dukungan varian produk (ukuran, warna, tipe).
    - Kategorisasi produk yang fleksibel.
- **📈 Laporan & Analitik**:
    - Dashboard visual dengan grafik tren penjualan menggunakan *Recharts*.
    - Laporan laba rugi, nilai inventori, dan performa harian.
- **🏪 Manajemen Multi-Outlet**: Kelola banyak cabang toko dengan stok terpisah dalam satu sistem terpusat.
- **👥 Manajemen Pelanggan & Supplier**: Database lengkap untuk retensi pelanggan dan manajemen rantai pasok.
- **🔐 Keamanan & Hak Akses**: Sistem peran (roles) dan izin (permissions) yang mendalam untuk Admin dan Kasir.
- **🌗 Desain Premium**: Antarmuka modern dengan dukungan **Mode Gelap (Dark Mode)** dan estetika *Glassmorphism*.

## 🚀 Teknologi Utama

- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: React 18, TypeScript, Inertia.js
- **Styling**: Tailwind CSS (Vite integration)
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🛠️ Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan project di lingkungan lokal:

1. **Clone repositori**
   ```bash
   git clone https://github.com/username/codecpos.git
   cd codecpos
   ```

2. **Instalasi dependensi PHP**
   ```bash
   composer install
   ```

3. **Instalasi dependensi JavaScript**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Atur konfigurasi database di file `.env`.*

5. **Migrasi Database & Seeding**
   ```bash
   php artisan migrate --seed
   ```

6. **Jalankan Aplikasi**
   ```bash
   # Jalankan development server untuk frontend
   npm run dev

   # Jalankan server Laravel (di terminal baru)
   php artisan serve
   ```

## 📝 Catatan Pengembangan

Aplikasi ini terus dikembangkan untuk fitur-fitur baru seperti integrasi pembayaran digital (QRIS) dan laporan yang lebih mendalam. 

## ⚖️ Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---
*Dibuat dengan ❤️ untuk efisiensi bisnis Anda.*
