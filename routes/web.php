<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\Inventory\StockAdjustmentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->intended(route('portal', absolute: false));
    }
    return redirect()->route('login');
});

Route::get('/portal', function () {
    return Inertia::render('Portal');
})->middleware(['auth', 'verified'])->name('portal');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Products
    Route::resource('products', ProductController::class)->except(['show']);

    // Categories
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);

    // POS
    Route::get('/pos', [SaleController::class, 'create'])->name('pos');
    Route::post('/pos/checkout', [SaleController::class, 'store'])->name('pos.checkout');
    Route::post('/pos/set-outlet', [SaleController::class, 'setOutlet'])->name('pos.set-outlet');

    // Sales History
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::post('/sales/{sale}/void', [SaleController::class, 'void'])->name('sales.void');

    // Customers
    Route::resource('customers', CustomerController::class)->except(['show', 'create', 'edit']);

    // Suppliers
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class)->except(['show', 'create', 'edit']);

    // Purchases
    Route::resource('purchases', \App\Http\Controllers\PurchaseController::class)->except(['edit', 'update', 'destroy']);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'store'])->name('settings.store');

    // Outlets
    Route::resource('outlets', \App\Http\Controllers\OutletController::class)->except(['show', 'create', 'edit']);

    // Stock Adjustment (Opname)
    Route::get('/inventory/adjustment', [StockAdjustmentController::class, 'index'])->name('inventory.adjustment');
    Route::post('/inventory/adjustment', [StockAdjustmentController::class, 'store'])->name('inventory.adjustment.store');

    // User Management & RBAC
    Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show', 'create', 'edit']);
    Route::get('/roles', [\App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');

    // Shifts
    Route::get('/shifts', [\App\Http\Controllers\ShiftController::class, 'index'])->name('shifts.index');
    Route::post('/shifts/start', [\App\Http\Controllers\ShiftController::class, 'start'])->name('shifts.start');
    Route::post('/shifts/end', [\App\Http\Controllers\ShiftController::class, 'end'])->name('shifts.end');

    // Sales Returns
    Route::get('/returns', [\App\Http\Controllers\SaleReturnController::class, 'index'])->name('returns.index');
    Route::get('/returns/create/{sale}', [\App\Http\Controllers\SaleReturnController::class, 'create'])->name('returns.create');
    Route::post('/returns', [\App\Http\Controllers\SaleReturnController::class, 'store'])->name('returns.store');
    Route::get('/returns/{saleReturn}', [\App\Http\Controllers\SaleReturnController::class, 'show'])->name('returns.show');

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/inventory', [ReportController::class, 'inventory'])->name('reports.inventory');
        Route::get('/financial', [ReportController::class, 'financial'])->name('reports.financial');
        Route::get('/comparison', [ReportController::class, 'comparison'])->name('reports.comparison');
        
        // Exports
        Route::get('/shifts', [ReportController::class, 'shifts'])->name('reports.shifts');
        Route::get('/sales/export-excel', [ReportController::class, 'exportSalesExcel'])->name('reports.sales.export.excel');
        Route::get('/sales/export/pdf', [ReportController::class, 'exportSalesPdf'])->name('reports.sales.export.pdf');
    });
});

require __DIR__.'/auth.php';
