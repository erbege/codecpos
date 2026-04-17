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
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });
        Schema::table('shifts', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });
        Schema::table('sale_returns', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_tables', function (Blueprint $table) {
            //
        });
    }
};
