# CodecPOS — Modern Professional Point of Sale

![CodecPOS Hero Banner](public/images/banner.png)

CodecPOS is a sophisticated, single-screen Point of Sale ecosystem designed for high-performance retail operations. Built with **Laravel 11**, **React 18**, and **TypeScript**, it offers a seamless blend of power and aesthetics.

## ✨ Key Features

- 🛒 **Rapid POS Interface**: A high-sensitivity checkout system optimized for speed and accuracy.
- 📦 **Inventory Intelligence**: Advanced stock management with support for product variants and independent SKU tracking.
- 📊 **Dynamic Analytics**: Real-time sales trends, financial reports, and inventory valuation dashboards.
- 👥 **Master Data Management**: Comprehensive databases for customers, suppliers, and multi-user access control.
- 🏢 **Multi-Outlet Ready**: Unified management for multiple business locations with independent stock tracking.
- 🌙 **Modern Dark Mode**: A premium, high-contrast UI designed to reduce eye strain during long shifts.

## 🛠️ Technical Stack

- **Backend**: [Laravel](https://laravel.com/) (Expressive PHP Framework)
- **Frontend**: [React](https://reactjs.org/) + [Inertia.js](https://inertiajs.com/) (The modern monolith)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight & Reactive)
- **Typography**: Inter & Outfit (Modern Sans Serif)
- **Icons**: [Lucide React](https://lucide.dev/) (Clean & Precise)

## 🚀 Getting Started

### Prerequisites

- PHP 8.3+
- Node.js 20+
- Composer
- NPM

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/codecpos.git
   cd codecpos
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database Setup**
   ```bash
   # Configure your database in .env
   php artisan migrate --seed
   ```

5. **Run Application**
   ```bash
   # Run development server
   npm run dev
   ```

## 🏗️ Architecture

CodecPOS follows a clean, modular architecture. Every module (POS, Inventory, Reports) is designed to be highly decoupled for scalability.

```text
app/
├── Models/        # Eloquent Data Structures
├── Http/
│   ├── Controllers/ # Inertia Request Handlers
│   └── Requests/    # Validation Logic
└── Services/      # Core Business Logic
resources/
└── js/
    ├── Pages/      # React View Components
    ├── Components/ # Reusable UI Elements
    └── types/      # TypeScript Definitions
```

## 📝 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

---

<p align="center">
  Built with ❤️ by <b>CodecPOS Team</b>
</p>
