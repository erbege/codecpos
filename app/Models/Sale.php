<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = [
        'invoice_number',
        'outlet_id',
        'user_id',
        'customer_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'paid',
        'change',
        'payment_method',
        'status',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'paid' => 'decimal:2',
        'change' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(SaleReturn::class);
    }

    /**
     * PHASE 2 OPTIMIZATION - Auto-invalidate cache
     */
    protected static function booted()
    {
        static::saved(function ($sale) {
            \Illuminate\Support\Facades\Cache::forget("dashboard_stats_outlet_{$sale->outlet_id}");
            
            // Find active shift for this user/outlet and invalidate its cache
            $activeShift = \App\Models\Shift::where('user_id', $sale->user_id)
                ->where('outlet_id', $sale->outlet_id)
                ->where('status', 'open')
                ->first();
            
            if ($activeShift) {
                \Illuminate\Support\Facades\Cache::forget("shift_{$activeShift->id}_expected_ending_cash");
            }
        });
    }
}
