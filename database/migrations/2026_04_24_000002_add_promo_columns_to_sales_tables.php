<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add promo audit columns to sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('promo_discount', 12, 2)->default(0)->after('discount');
            $table->string('promo_name')->nullable()->after('promo_discount');
            $table->foreignId('promotion_id')->nullable()->after('promo_name')
                ->constrained()->nullOnDelete();
        });

        // Add promo audit columns to sale_items table
        Schema::table('sale_items', function (Blueprint $table) {
            $table->decimal('promo_discount', 12, 2)->default(0)->after('discount');
            $table->foreignId('promotion_id')->nullable()->after('promo_discount')
                ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['promotion_id']);
            $table->dropColumn(['promo_discount', 'promotion_id']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['promotion_id']);
            $table->dropColumn(['promo_discount', 'promo_name', 'promotion_id']);
        });
    }
};
