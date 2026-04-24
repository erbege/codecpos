<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutletProductSetting extends Model
{
    protected $fillable = [
        'outlet_id',
        'product_id',
        'product_variant_id',
        'stock',
        'min_stock',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'min_stock' => 'integer',
        'is_active' => 'boolean',
    ];

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * PHASE 2 OPTIMIZATION - Auto-invalidate cache
     */
    protected static function booted()
    {
        static::saved(function ($setting) {
            app(\App\Services\ProductService::class)->invalidateProductCache($setting->product_id, $setting->outlet_id);
        });

        static::deleted(function ($setting) {
            app(\App\Services\ProductService::class)->invalidateProductCache($setting->product_id, $setting->outlet_id);
        });
    }
}
