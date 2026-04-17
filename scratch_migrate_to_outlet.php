<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

try {
    $mainOutlet = Outlet::first();
    if (!$mainOutlet) {
        throw new \Exception("Main outlet not found. Run scratch_init_outlet.php first.");
    }

    DB::transaction(function () use ($mainOutlet) {
        // 1. Migrate Product Stock & Prices
        $products = Product::all();
        foreach ($products as $p) {
            DB::table('outlet_product_settings')->updateOrInsert(
                [
                    'outlet_id' => $mainOutlet->id,
                    'product_id' => $p->id,
                    'product_variant_id' => null,
                ],
                [
                    'stock' => $p->stock,
                    'min_stock' => $p->min_stock,
                    'price' => $p->price,
                    'is_active' => $p->is_active,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 2. Migrate Variant Stock & Prices
        $variants = ProductVariant::all();
        foreach ($variants as $v) {
            DB::table('outlet_product_settings')->updateOrInsert(
                [
                    'outlet_id' => $mainOutlet->id,
                    'product_id' => $v->product_id,
                    'product_variant_id' => $v->id,
                ],
                [
                    'stock' => $v->stock,
                    'min_stock' => $v->min_stock ?? 0,
                    'price' => $v->price,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Update NULL outlet_id in transactions
        DB::table('sales')->whereNull('outlet_id')->update(['outlet_id' => $mainOutlet->id]);
        DB::table('purchases')->whereNull('outlet_id')->update(['outlet_id' => $mainOutlet->id]);
        DB::table('stock_movements')->whereNull('outlet_id')->update(['outlet_id' => $mainOutlet->id]);
        DB::table('shifts')->whereNull('outlet_id')->update(['outlet_id' => $mainOutlet->id]);
        DB::table('sale_returns')->whereNull('outlet_id')->update(['outlet_id' => $mainOutlet->id]);

        echo "Data migration successful.\n";
    });
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
