Berikut adalah rancangan lengkap untuk aplikasi POS (Point of Sale) toko sepeda dengan stack **Laravel + Inertia.js + React + Tailwind CSS + MySQL/MariaDB + Zustand** serta sistem **RBAC (Role-Based Access Control)**.

---

# 🧱 1. Arsitektur Sistem

## 🔹 High-Level Architecture

```text
[ Client (React + Inertia) ]
        ↓
[ Laravel Backend (API + SSR via Inertia) ]
        ↓
[ MySQL / MariaDB Database ]
```

---

## 🔹 Tech Stack & Responsibility

| Layer      | Technology         | Tugas                               |
| ---------- | ------------------ | ----------------------------------- |
| Frontend   | React + Inertia.js | UI, interaksi user                  |
| Styling    | Tailwind CSS       | Desain responsif                    |
| State Mgmt | Zustand            | Global state (cart, auth, UI state) |
| Backend    | Laravel            | Business logic, RBAC, API           |
| Database   | MySQL/MariaDB      | Penyimpanan data                    |

---

## 🔹 Struktur Folder (Simplified)

### Backend (Laravel)

```bash
app/
 ├── Models/
 ├── Http/
 │    ├── Controllers/
 │    ├── Middleware/
 ├── Services/
 ├── Policies/          # RBAC logic
 ├── Repositories/
database/
 ├── migrations/
 ├── seeders/
routes/
 ├── web.php
```

---

### Frontend (React + Inertia)

```bash
resources/js/
 ├── Pages/
 ├── Components/
 ├── Layouts/
 ├── Stores/        # Zustand
 ├── Hooks/
 ├── Utils/
```

---

# 🔐 2. RBAC (Role-Based Access Control)

## 🔹 Role

* Admin
* Kasir
* Owner

## 🔹 Permission

Contoh:

| Permission      | Deskripsi     |
| --------------- | ------------- |
| manage_users    | Kelola user   |
| manage_products | Kelola produk |
| manage_sales    | Transaksi     |
| view_reports    | Lihat laporan |

---

## 🔹 Relasi Database

```text
users
roles
permissions
role_user (pivot)
permission_role (pivot)
```

---

## 🔹 Middleware RBAC

```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/users', ...);
});
```

Atau menggunakan **Policy / Gate Laravel** untuk kontrol lebih granular.

---

# 🔄 3. Workflow Sistem

## 🔹 1. Login

```text
User → Login Form → Laravel Auth → Session → Redirect Dashboard
```

---

## 🔹 2. POS Transaction

```text
Kasir buka POS
→ Scan / pilih produk
→ Tambah ke cart (Zustand)
→ Hitung total
→ Input pembayaran
→ Simpan transaksi ke database
→ Cetak struk
```

---

## 🔹 3. Manajemen Produk

```text
Admin
→ Tambah/Edit/Hapus Produk
→ Upload gambar
→ Set stok & harga
```

---

## 🔹 4. Laporan

```text
Owner/Admin
→ Pilih periode
→ Generate laporan
→ Tampilkan grafik / tabel
```

---

# 🧭 4. User Flow

## 🔹 A. Login Flow

```text
[Login Page]
    ↓
Input email + password
    ↓
Validasi
    ↓
Berhasil → Dashboard
Gagal → Error message
```

---

## 🔹 B. Kasir (Sales Flow)

```text
[Dashboard]
    ↓
Klik "POS"
    ↓
Cari / scan produk
    ↓
Tambah ke cart
    ↓
Review cart
    ↓
Input pembayaran
    ↓
Konfirmasi transaksi
    ↓
Cetak struk
```

---

## 🔹 C. Admin Flow

```text
[Dashboard]
    ↓
Kelola Produk
    ↓
Tambah/Edit/Hapus
    ↓
Kelola User
    ↓
Assign Role
```

---

## 🔹 D. Owner Flow

```text
[Dashboard]
    ↓
Lihat Laporan
    ↓
Filter tanggal
    ↓
Analisis penjualan
```

---

# 🧠 5. State Management (Zustand)

## 🔹 Store Structure

```js
// useCartStore.js
{
  items: [],
  addItem: () => {},
  removeItem: () => {},
  total: 0
}

// useAuthStore.js
{
  user: null,
  roles: [],
  permissions: []
}
```

---

## 🔹 Flow State

```text
React Component
    ↓
Zustand Store
    ↓
Update UI langsung
```

---

# 🗄️ 6. Desain Database (Core Tables)

## 🔹 Products

```text
id
name
price
stock
category_id
```

## 🔹 Transactions

```text
id
user_id
total
paid
change
created_at
```

## 🔹 Transaction Items

```text
id
transaction_id
product_id
qty
price
```

---

# ⚙️ 7. API / Route Design

## 🔹 Example Routes

```php
Route::get('/products', ProductController@index);
Route::post('/transactions', TransactionController@store);
Route::get('/reports', ReportController@index);
```

---

# 🎨 8. UI/UX Structure

## 🔹 Layout

* Sidebar Navigation
* Topbar (User Info)
* Main Content

## 🔹 Pages

* Dashboard
* POS
* Products
* Users
* Reports

---

# 🚀 9. Best Practices

* Gunakan **Service Layer** di Laravel
* Gunakan **Form Request Validation**
* Pisahkan logic bisnis dari controller
* Gunakan **lazy loading Inertia**
* Cache laporan jika besar
* Gunakan **soft delete untuk transaksi**

---

# 📌 10. Enhancement (Opsional)

* Barcode Scanner integration
* Multi-outlet support
* Export laporan (PDF/Excel)
* Notifikasi stok habis
* Audit log user activity

---

Kalau mau, saya bisa lanjutkan ke:

* ERD diagram
* Contoh implementasi RBAC Laravel (Spatie)
* Struktur kode awal (starter template)
* Desain UI POS (React + Tailwind)

Tinggal bilang 👍
