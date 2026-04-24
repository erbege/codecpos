<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionItem extends Model
{
    protected $fillable = [
        'promotion_id',
        'product_id',
        'product_variant_id',
        'max_qty',
        'qty_used',
    ];

    protected $casts = [
        'max_qty' => 'integer',
        'qty_used' => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Check if this item has a qty limit (Tipe E).
     */
    public function hasQtyLimit(): bool
    {
        return $this->max_qty !== null;
    }

    /**
     * Check if qty is still available for this promo item.
     */
    public function isQtyAvailable(int $requestedQty = 1): bool
    {
        if (!$this->hasQtyLimit()) return true;
        return ($this->qty_used + $requestedQty) <= $this->max_qty;
    }

    /**
     * Get remaining qty available for this promo item.
     */
    public function remainingQty(): ?int
    {
        if (!$this->hasQtyLimit()) return null;
        return max(0, $this->max_qty - $this->qty_used);
    }
}
