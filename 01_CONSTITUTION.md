Berikut adalah **Project Constitution** (semacam “aturan main” + prinsip dasar engineering) untuk aplikasi POS toko sepeda yang kamu bangun.

---

# 📜 Project Constitution

**POS Toko Sepeda – Laravel + Inertia + React**

---

## 🎯 1. Tujuan Proyek

Membangun aplikasi **Point of Sale (POS)** yang:

* Cepat, stabil, dan mudah digunakan oleh kasir
* Aman dengan sistem **RBAC (Role-Based Access Control)**
* Mudah dikembangkan (scalable & maintainable)
* Mendukung operasional toko sepeda (produk, stok, transaksi, laporan)

---

## 🧭 2. Prinsip Utama (Core Principles)

### 2.1 Simplicity First

* Hindari over-engineering
* Gunakan solusi paling sederhana yang scalable

---

### 2.2 Separation of Concerns

* Backend hanya untuk business logic
* Frontend hanya untuk UI & interaksi
* State global hanya di Zustand

---

### 2.3 Security by Default

* Semua endpoint harus dilindungi auth
* RBAC wajib untuk setiap aksi sensitif
* Validasi selalu di backend

---

### 2.4 Developer Experience (DX)

* Struktur kode harus konsisten
* Naming harus jelas dan predictable
* Mudah onboarding developer baru

---

### 2.5 Performance Matters

* Hindari query N+1
* Gunakan eager loading
* Cache untuk laporan berat

---

## 🧱 3. Arsitektur Rules

---

### 3.1 Backend (Laravel)

#### ✅ WAJIB:

* Gunakan **Service Layer**
* Gunakan **Form Request Validation**
* Gunakan **Policy / Gate untuk RBAC**
* Gunakan **Repository Pattern (opsional tapi direkomendasikan)**

#### ❌ DILARANG:

* Logic bisnis di Controller
* Query langsung di Controller
* Hardcode permission

---

### 3.2 Frontend (React + Inertia)

#### ✅ WAJIB:

* Gunakan **Zustand untuk state global**
* Gunakan **custom hooks untuk logic reusable**
* Pisahkan UI dan logic

#### ❌ DILARANG:

* Fetch API langsung di banyak tempat (harus terpusat)
* State global pakai useState (gunakan Zustand)

---

### 3.3 State Management (Zustand)

#### Rules:

* Cart → global state
* Auth → global state
* UI kecil → local state

---

## 🔐 4. RBAC Rules

---

### 4.1 Semua Aksi Harus Dicek Permission

Contoh:

* Create product → `manage_products`
* View report → `view_reports`

---

### 4.2 Role Tidak Digunakan Langsung di Code

❌ Salah:

```php
if ($user->role === 'admin')
```

✅ Benar:

```php
$user->can('manage_products')
```

---

### 4.3 Role Default

* Admin → full access
* Kasir → transaksi saja
* Owner → laporan + monitoring

---

## 🗄️ 5. Database Rules

---

### 5.1 Standard Naming

* Table: plural (`products`, `transactions`)
* Column: snake_case (`created_at`)

---

### 5.2 Relasi

* Gunakan foreign key
* Gunakan cascade jika aman

---

### 5.3 Soft Delete

* Gunakan untuk:

  * products
  * users
* Tidak untuk:

  * transactions (harus immutable)

---

## 🔄 6. Workflow Development

---

### 6.1 Git Workflow

* `main` → production
* `develop` → staging
* `feature/*` → fitur baru
* `fix/*` → bug fix

---

### 6.2 Naming Branch

```bash
feature/pos-transaction
feature/product-management
fix/cart-bug
```

---

### 6.3 Code Review Rules

* Minimal 1 reviewer
* Tidak boleh merge tanpa review
* Fokus pada:

  * readability
  * security
  * performance

---

## 🧪 7. Testing Rules

---

### 7.1 Backend

* Wajib test untuk:

  * transaksi
  * RBAC
  * laporan

---

### 7.2 Frontend

* Minimal:

  * critical flow (POS transaction)
* Gunakan:

  * unit test (logic)
  * manual test (UI)

---

## 🎨 8. UI/UX Rules

---

### 8.1 Prinsip UI POS

* Cepat (minim klik)
* Bisa pakai keyboard
* Mobile friendly (tablet kasir)

---

### 8.2 Design System

* Gunakan Tailwind
* Konsisten:

  * spacing
  * warna
  * typography

---

## ⚡ 9. Performance Rules

---

### Backend

* Gunakan eager loading
* Hindari loop query
* Gunakan indexing di DB

---

### Frontend

* Lazy load halaman
* Hindari re-render berlebihan
* Gunakan memoization jika perlu

---

## 🔒 10. Security Rules

---

* Password wajib di-hash
* CSRF protection aktif
* Validasi semua input
* Sanitasi input user

---

## 📦 11. Deployment Rules

---

* Gunakan environment:

  * `.env.production`
* Jangan commit:

  * `.env`
  * secret keys

---

## 🚨 12. Error Handling

---

### Backend

* Gunakan standard response:

```json
{
  "message": "Error message",
  "errors": {}
}
```

---

### Frontend

* Tampilkan error yang jelas ke user
* Jangan expose error sensitif

---

## 📈 13. Logging & Monitoring

---

* Log:

  * transaksi
  * error
  * aktivitas user penting

---

## 🧩 14. Extensibility Rules

---

Harus mudah ditambahkan:

* Multi-outlet
* Diskon
* Membership
* Integrasi payment gateway

---

## 🏁 15. Definition of Done (DoD)

Sebuah fitur dianggap selesai jika:

* ✅ Berjalan sesuai requirement
* ✅ Sudah ada validasi
* ✅ Sudah melewati RBAC
* ✅ Sudah dites
* ✅ Sudah di-review
* ✅ Tidak merusak fitur lain

---

# 🔥 Penutup

Constitution ini adalah “kontrak tim” — semua developer wajib mengikuti agar:

* Kode tetap rapi
* Sistem tetap aman
* Development tetap cepat

---

Kalau kamu mau, next step yang paling powerful:

* 🔥 Setup boilerplate project (Laravel + Inertia + Zustand)
* 🔥 Implementasi RBAC pakai Spatie
* 🔥 ERD + migration siap pakai

Tinggal bilang aja mau lanjut ke mana.
