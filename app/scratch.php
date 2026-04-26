<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test create
$currentOutletId = null;
$product_id = 5;
$data = ['stock' => 50, 'min_stock' => 10, 'price' => 4500000];

try {
    \App\Models\OutletProductSetting::create([
        'outlet_id' => null, // Deliberately simulating null
        'product_id' => $product_id,
        'product_variant_id' => null,
        'stock' => 50,
        'min_stock' => 10,
        'price' => 4500000,
    ]);
} catch (\Exception $e) {
    echo "Create null error: " . $e->getMessage() . PHP_EOL;
}
