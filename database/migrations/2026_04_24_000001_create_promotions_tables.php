<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Main promotions table
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // "Grand Opening Sale"
            $table->string('code')->unique()->nullable();    // Optional promo code
            $table->text('description')->nullable();

            // Scope: product = applied per-item, global = applied at checkout
            $table->enum('scope', ['product', 'global']);

            // Discount value configuration
            $table->enum('discount_type', ['percentage', 'fixed']); // Persen atau nominal
            $table->decimal('discount_value', 12, 2);               // 15 (=15%) atau 25000 (=Rp25.000)
            $table->decimal('max_discount', 12, 2)->nullable();      // Cap untuk persen (opsional)

            // Conditions
            $table->decimal('min_purchase', 12, 2)->nullable();      // Minimum belanja (null = tanpa syarat)
            $table->dateTime('start_date');
            $table->dateTime('end_date');

            // Limits & tracking
            $table->integer('max_usage')->nullable();         // Batas jumlah TRANSAKSI (null = unlimited)
            $table->integer('usage_count')->default(0);       // Auto-increment saat dipakai
            $table->integer('priority')->default(0);          // Non-stackable: yang tertinggi menang

            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            // Composite index for active promo lookup
            $table->index(['scope', 'is_active', 'start_date', 'end_date'], 'promotions_active_lookup');
        });

        // 2. Pivot: which products/variants are included in a product-scope promo
        Schema::create('promotion_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants');

            // Tipe E: per-product qty limit within this promo
            $table->integer('max_qty')->nullable();     // null = unlimited units
            $table->integer('qty_used')->default(0);    // Counter of units sold via this promo

            $table->timestamps();

            $table->unique(['promotion_id', 'product_id', 'product_variant_id'], 'promo_item_unique');
        });

        // 3. Pivot: which outlets this promo applies to (empty = all outlets)
        Schema::create('promotion_outlets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['promotion_id', 'outlet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_outlets');
        Schema::dropIfExists('promotion_items');
        Schema::dropIfExists('promotions');
    }
};
