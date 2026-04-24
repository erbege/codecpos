<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Contoh Scheduler: Cek stok rendah setiap hari jam 8 pagi
Schedule::call(function () {
    $lowStockCount = Product::whereColumn('stock', '<=', 'min_stock')->count();
    
    if ($lowStockCount > 0) {
        Log::info("Daily Stock Check: Ada {$lowStockCount} produk dengan stok rendah.");
    }
})->dailyAt('08:00');

// PHASE 3 OPTIMIZATION: Warm up product cache hourly
Schedule::command('cache:warm-products')->hourly();
