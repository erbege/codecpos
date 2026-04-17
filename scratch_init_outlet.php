<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Outlet;
use App\Models\User;

try {
    $outlet = Outlet::firstOrCreate(['name' => 'Outlet Utama'], [
        'address' => 'Alamat Pusat',
        'is_active' => true
    ]);

    $count = User::whereNull('outlet_id')->update(['outlet_id' => $outlet->id]);

    echo "Successfully created outlet: {$outlet->name}\n";
    echo "Assigned {$count} users to this outlet.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
