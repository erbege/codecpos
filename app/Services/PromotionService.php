<?php

namespace App\Services;

use App\Models\Promotion;
use App\Models\PromotionItem;
use Illuminate\Support\Collection;

class PromotionService
{
    /**
     * Get all active product-scope promotions for a specific outlet.
     * Used when loading the POS page to show promo badges.
     */
    public function getActiveProductPromotions(int $outletId): Collection
    {
        return Promotion::active()
            ->productScope()
            ->forOutlet($outletId)
            ->with(['items' => function ($q) {
                $q->with(['product:id,name,sku', 'productVariant:id,name,sku']);
            }])
            ->orderByDesc('priority')
            ->get();
    }

    /**
     * Get all active global-scope promotions for a specific outlet.
     * Used at checkout to show global promo banners.
     */
    public function getActiveGlobalPromotions(int $outletId): Collection
    {
        return Promotion::active()
            ->globalScope()
            ->forOutlet($outletId)
            ->orderByDesc('priority')
            ->get();
    }

    /**
     * Calculate the best promo discount for a single cart item.
     * Non-stackable: returns the single best (highest discount) promo.
     *
     * Considers:
     * - Product/variant match
     * - Period validity
     * - Min purchase requirement (Tipe B)
     * - Qty availability (Tipe E)
     * - Outlet applicability
     *
     * @return array{discount: float, promotion_id: int|null, promo_name: string|null, promotion_item_id: int|null}
     */
    public function calculateItemPromoDiscount(
        int    $productId,
        ?int   $variantId,
        float  $itemPrice,
        int    $qty,
        float  $cartSubtotal,
        int    $outletId
    ): array {
        $result = [
            'discount' => 0,
            'promotion_id' => null,
            'promo_name' => null,
            'promotion_item_id' => null,
        ];

        $promos = Promotion::active()
            ->productScope()
            ->forOutlet($outletId)
            ->whereHas('items', function ($q) use ($productId, $variantId) {
                $q->where('product_id', $productId);
                if ($variantId) {
                    $q->where(function ($sq) use ($variantId) {
                        $sq->where('product_variant_id', $variantId)
                            ->orWhereNull('product_variant_id'); // null = all variants
                    });
                } else {
                    $q->whereNull('product_variant_id');
                }
            })
            ->with(['items' => function ($q) use ($productId, $variantId) {
                $q->where('product_id', $productId);
                if ($variantId) {
                    $q->where(function ($sq) use ($variantId) {
                        $sq->where('product_variant_id', $variantId)
                            ->orWhereNull('product_variant_id');
                    });
                } else {
                    $q->whereNull('product_variant_id');
                }
            }])
            ->orderByDesc('priority')
            ->get();

        $bestDiscount = 0;

        foreach ($promos as $promo) {
            // Check min purchase
            if (!$promo->meetsMinPurchase($cartSubtotal)) {
                continue;
            }

            // Find the matching promotion_item
            $promoItem = $promo->items->first();
            if (!$promoItem) continue;

            // Check Tipe E qty availability
            if ($promoItem->hasQtyLimit() && !$promoItem->isQtyAvailable($qty)) {
                continue;
            }

            // Calculate discount
            $discount = $promo->calculateDiscount($itemPrice, $qty);

            // Non-stackable: keep the best
            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $result = [
                    'discount' => $discount,
                    'promotion_id' => $promo->id,
                    'promo_name' => $promo->name,
                    'promotion_item_id' => $promoItem->id,
                ];
            }
        }

        return $result;
    }

    /**
     * Calculate the best global promo discount for the total transaction.
     * Non-stackable: returns the single best (highest discount) promo.
     *
     * @return array{discount: float, promotion_id: int|null, promo_name: string|null}
     */
    public function calculateGlobalPromoDiscount(
        float $subtotal,
        int   $outletId
    ): array {
        $result = [
            'discount' => 0,
            'promotion_id' => null,
            'promo_name' => null,
        ];

        $promos = Promotion::active()
            ->globalScope()
            ->forOutlet($outletId)
            ->orderByDesc('priority')
            ->get();

        $bestDiscount = 0;

        foreach ($promos as $promo) {
            if (!$promo->meetsMinPurchase($subtotal)) {
                continue;
            }

            // For global scope, calculate based on subtotal as if qty=1
            $discount = $promo->calculateDiscount($subtotal, 1);

            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $result = [
                    'discount' => $discount,
                    'promotion_id' => $promo->id,
                    'promo_name' => $promo->name,
                ];
            }
        }

        return $result;
    }

    /**
     * Increment the transaction usage counter for a promotion.
     */
    public function recordUsage(int $promotionId): void
    {
        Promotion::where('id', $promotionId)->increment('usage_count');
    }

    /**
     * Increment the qty_used counter on promotion_items (Tipe E).
     */
    public function recordItemQtyUsage(
        int  $promotionId,
        int  $productId,
        ?int $variantId,
        int  $qtySold
    ): void {
        $query = PromotionItem::where('promotion_id', $promotionId)
            ->where('product_id', $productId);

        if ($variantId) {
            $query->where(function ($q) use ($variantId) {
                $q->where('product_variant_id', $variantId)
                    ->orWhereNull('product_variant_id');
            });
        } else {
            $query->whereNull('product_variant_id');
        }

        $query->increment('qty_used', $qtySold);
    }

    /**
     * Prepare active promotions data for the POS frontend.
     * Returns a simplified structure for the frontend to use.
     */
    public function getPromotionsForPOS(int $outletId): array
    {
        $productPromos = $this->getActiveProductPromotions($outletId);
        $globalPromos = $this->getActiveGlobalPromotions($outletId);

        return [
            'product' => $productPromos->map(function ($promo) {
                return [
                    'id' => $promo->id,
                    'name' => $promo->name,
                    'scope' => $promo->scope,
                    'discount_type' => $promo->discount_type,
                    'discount_value' => (float) $promo->discount_value,
                    'max_discount' => $promo->max_discount ? (float) $promo->max_discount : null,
                    'min_purchase' => $promo->min_purchase ? (float) $promo->min_purchase : null,
                    'priority' => $promo->priority,
                    'items' => $promo->items->map(function ($item) {
                        return [
                            'product_id' => $item->product_id,
                            'product_variant_id' => $item->product_variant_id,
                            'max_qty' => $item->max_qty,
                            'remaining_qty' => $item->remainingQty(),
                        ];
                    }),
                ];
            }),
            'global' => $globalPromos->map(function ($promo) {
                return [
                    'id' => $promo->id,
                    'name' => $promo->name,
                    'discount_type' => $promo->discount_type,
                    'discount_value' => (float) $promo->discount_value,
                    'max_discount' => $promo->max_discount ? (float) $promo->max_discount : null,
                    'min_purchase' => $promo->min_purchase ? (float) $promo->min_purchase : null,
                    'priority' => $promo->priority,
                ];
            }),
        ];
    }
}
