# CodecPOS - Sistem Kasir (POS) Profesional & Modern

CodecPOS adalah aplikasi Point of Sale (POS) mutakhir yang dirancang khusus untuk toko sepeda dan bisnis ritel modern. Dibangun dengan kombinasi teknologi **Laravel 11**, **React**, dan **Inertia.js**, CodecPOS menawarkan pengalaman pengguna yang sangat cepat, estetis, dan kaya fitur.

![Screenshots Placeholder](https://via.placeholder.com/1200x600?text=CodecPOS+Interface+Preview)

## ✨ Fitur Utama

- **🛒 Kasir (POS) Responsif**: Antarmuka penjualan yang cepat dengan dukungan pemindaian barcode, pengelolaan keranjang instan, dan shortcut keyboard (F2, F5, F8, F9).
- **🏷️ Promo Diskon Otomatis** *(BARU)*:
    - **5 tipe promo**: Produk berjangka waktu, produk + min belanja, produk + batas qty, global berjangka waktu, global + min belanja.
    - Diskon otomatis di POS dengan badge harga coret, banner promo global, dan progress hint.
    - Non-stackable (diskon terbaik yang diterapkan), mendukung persentase & nominal tetap.
    - Konfigurasi per-outlet, batas penggunaan transaksi, dan batas kuota unit per produk.
    - Audit trail lengkap: diskon promo tercatat di setiap transaksi dan item.
- **📦 Manajemen Inventori**:
    - Pelacakan stok secara real-time per outlet.
    - Dukungan varian produk (ukuran, warna, tipe).
    - Kategorisasi produk yang fleksibel.
    - Stock Opname (penyesuaian stok) dengan riwayat perubahan.
- **📈 Laporan & Analitik**:
    - Dashboard visual dengan grafik tren penjualan menggunakan *Recharts*.
    - Laporan penjualan, keuangan, operasional, inventori, dan perbandingan.
    - Ekspor laporan ke Excel dan PDF.
- **🏪 Manajemen Multi-Outlet**: Kelola banyak cabang toko dengan stok terpisah, harga per-outlet, dan promo per-outlet dalam satu sistem terpusat.
- **👥 Manajemen Pelanggan & Supplier**: Database lengkap untuk retensi pelanggan dan manajemen rantai pasok.
- **🔄 Retur Penjualan**: Proses pengembalian barang dengan pelacakan alasan retur dan pengembalian stok otomatis.
- **⏰ Manajemen Shift Kasir**: Buka/tutup shift dengan PIN, rekap penjualan per shift, dan force-close oleh manager.
- **📥 Barang Masuk (Purchase Order)**: Pencatatan pembelian dari supplier dengan update stok otomatis.
- **🔐 Keamanan & Hak Akses (RBAC)**:
    - Peran granular: Admin, Owner, Manager, Kasir, Inventory Staff.
    - Izin detail per modul (produk, penjualan, promo, laporan, outlet, dll).
    - Autentikasi PIN untuk shift dan handover kasir.
- **🌗 Desain Premium**: Antarmuka modern dengan dukungan **Mode Gelap (Dark Mode)**, estetika premium, dan fully responsive (desktop, tablet, mobile).

## 🚀 Teknologi Utama

| Layer | Teknologi |
|---|---|
| **Backend** | Laravel 11 (PHP 8.2+) |
| **Frontend** | React 18, TypeScript, Inertia.js |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **RBAC** | Spatie Laravel Permission |
| **Caching** | Laravel Cache (Redis/File) |

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

Aplikasi ini terus dikembangkan secara aktif. Fitur terbaru yang ditambahkan:

- ✅ **Promo Diskon Otomatis** — Sistem promo 5 tipe dengan integrasi POS, admin panel, dan audit trail.
- ✅ **Manajemen Shift & PIN** — Autentikasi PIN 6 digit untuk shift kasir.
- ✅ **Retur Penjualan** — Proses retur dengan pengembalian stok otomatis.
- ✅ **Optimasi Performa** — Caching produk, code splitting, dan lazy loading.
- ✅ **Responsif Penuh** — UI yang optimal di semua ukuran layar.

## 📁 Struktur Modul

```
/pos              → Kasir (POS)
/shifts           → Manajemen Shift
/products         → Manajemen Produk
/categories       → Kategori Produk
/sales            → Riwayat Penjualan
/returns          → Retur Barang
/promotions       → Promo Diskon (BARU)
/customers        → Pelanggan
/suppliers        → Pemasok
/purchases        → Barang Masuk
/inventory        → Stock Opname
/reports          → Laporan & Analitik
/users            → Manajemen User
/roles            → Peran & Izin
/outlets          → Cabang Toko
/settings         → Pengaturan Toko
```

## ⚖️ Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---
*Dibuat dengan ❤️ untuk efisiensi bisnis Anda.*
