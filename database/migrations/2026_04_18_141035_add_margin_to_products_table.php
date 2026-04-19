<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('margin', 12, 2)->default(0)->after('cost_price');
        });

        // Initialize margin for existing products
        DB::table('products')->update([
            'margin' => DB::raw('price - cost_price')
        ]);

        // Add setting for tax_per_item
        DB::table('settings')->updateOrInsert(
            ['key' => 'tax_per_item'],
            ['value' => 'false', 'created_at' => now(), 'updated_at' => now()]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
