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
        // When variant exists, product itself becomes a shell/parent.
        // It has many variants. If no variant, default parent represents everything?
        // Let's create `product_variants` independent for products that HAVE variants.
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Merah - XL"
            $table->string('sku')->unique();
            $table->decimal('price', 12, 2)->nullable(); // Overrides parent price if set
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
