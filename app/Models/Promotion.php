<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'scope',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_purchase',
        'start_date',
        'end_date',
        'max_usage',
        'usage_count',
        'priority',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'max_usage' => 'integer',
        'usage_count' => 'integer',
        'priority' => 'integer',
        'is_active' => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(PromotionItem::class);
    }

    public function outlets(): BelongsToMany
    {
        return $this->belongsToMany(Outlet::class, 'promotion_outlets')
            ->withTimestamps();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    /**
     * Filter promotions that are currently active, within date range, and not exhausted.
     */
    public function scopeActive(Builder $query): Builder
    {
        $now = Carbon::now();

        return $query
            ->where('is_active', true)
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->where(function ($q) {
                $q->whereNull('max_usage')
                    ->orWhereColumn('usage_count', '<', 'max_usage');
            });
    }

    /**
     * Filter product-scope promotions.
     */
    public function scopeProductScope(Builder $query): Builder
    {
        return $query->where('scope', 'product');
    }

    /**
     * Filter global-scope promotions.
     */
    public function scopeGlobalScope(Builder $query): Builder
    {
        return $query->where('scope', 'global');
    }

    /**
     * Filter promotions applicable to a specific outlet.
     * If a promotion has no outlet restrictions, it applies to all outlets.
     */
    public function scopeForOutlet(Builder $query, int $outletId): Builder
    {
        return $query->where(function ($q) use ($outletId) {
            $q->whereDoesntHave('outlets')  // No records = all outlets
                ->orWhereHas('outlets', function ($sq) use ($outletId) {
                    $sq->where('outlet_id', $outletId);
                });
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Check if this promotion is currently valid (date + usage).
     */
    public function isValidNow(): bool
    {
        $now = Carbon::now();

        return $this->is_active
            && $now->between($this->start_date, $this->end_date)
            && !$this->isUsageLimitReached();
    }

    /**
     * Check if the usage limit has been reached.
     */
    public function isUsageLimitReached(): bool
    {
        return $this->max_usage !== null && $this->usage_count >= $this->max_usage;
    }

    /**
     * Check if the subtotal meets the minimum purchase requirement.
     */
    public function meetsMinPurchase(float $subtotal): bool
    {
        return $this->min_purchase === null || $subtotal >= (float) $this->min_purchase;
    }

    /**
     * Check if this promotion applies to all outlets.
     */
    public function appliesToAllOutlets(): bool
    {
        return $this->outlets()->count() === 0;
    }

    /**
     * Calculate the discount amount for a given base price and quantity.
     */
    public function calculateDiscount(float $basePrice, int $qty = 1): float
    {
        $itemTotal = $basePrice * $qty;

        if ($this->discount_type === 'percentage') {
            $discount = ($itemTotal * (float) $this->discount_value) / 100;
            // Apply max_discount cap if set
            if ($this->max_discount !== null && $discount > (float) $this->max_discount) {
                $discount = (float) $this->max_discount;
            }
        } else {
            // Fixed amount — apply per transaction/item, not per quantity
            $discount = (float) $this->discount_value;
        }

        // Discount cannot exceed the item total
        return min($discount, $itemTotal);
    }

    /**
     * Get human-readable status.
     */
    public function getStatusAttribute(): string
    {
        $now = Carbon::now();

        if (!$this->is_active) return 'inactive';
        if ($now->lt($this->start_date)) return 'upcoming';
        if ($now->gt($this->end_date)) return 'expired';
        if ($this->isUsageLimitReached()) return 'exhausted';

        return 'active';
    }
}
