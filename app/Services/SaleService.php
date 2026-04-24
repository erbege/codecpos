<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OutletProductSetting;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function __construct(
        protected ProductService $productService,
        protected PromotionService $promotionService,
    ) {}

    /**
     * Create a new sale transaction.
     * All operations wrapped in a DB transaction for atomicity.
     */
    public function createSale(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            // 1. Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // 2. Calculate totals
            $items = [];
            $outletId = $data['outlet_id'];
            $grossSubtotal = 0;

            foreach ($data['items'] as $item) {
                // Find product and variant (if any)
                $product = Product::findOrFail($item['product_id']);
                $variant = null;

                if (!empty($item['product_variant_id'])) {
                    $variant = ProductVariant::where('product_id', $product->id)
                        ->where('id', $item['product_variant_id'])
                        ->first();
                }

                // Get outlet-specific setting
                $setting = OutletProductSetting::where('outlet_id', $outletId)
                    ->where('product_id', $product->id)
                    ->where('product_variant_id', $item['product_variant_id'] ?? null)
                    ->lockForUpdate()
                    ->first();

                if (!$setting) {
                    throw new \Exception("Produk tidak tersedia di outlet ini.");
                }

                // Check stock
                $currentStock = $setting->stock;
                $itemName = $variant ? "{$product->name} - {$variant->name}" : $product->name;
                $itemPrice = $setting->price ?? ($variant && $variant->price ? $variant->price : $product->price);

                if ($currentStock < $item['qty']) {
                    throw new \Exception("Stok tidak cukup untuk produk: {$itemName}. Tersisa: {$currentStock}");
                }

                $grossSubtotal += ($itemPrice * $item['qty']);

                $items[] = [
                    'product' => $product,
                    'variant' => $variant,
                    'product_name' => $itemName,
                    'qty' => $item['qty'],
                    'price' => $itemPrice,
                    'frontend_discount' => $item['discount'] ?? 0,
                ];
            }

            // ─── Promo: Calculate item promos and manual discounts ─────────
            $totalManualDiscount = 0;
            $totalItemPromoDiscount = 0;
            $usedPromoIds = collect();

            foreach ($items as &$item) {
                $itemPromoResult = $this->promotionService->calculateItemPromoDiscount(
                    $item['product']->id,
                    $item['variant'] ? $item['variant']->id : null,
                    $item['price'],
                    $item['qty'],
                    $grossSubtotal,
                    $outletId
                );

                $itemPromoDiscount = $itemPromoResult['discount'];
                $itemPromoId = $itemPromoResult['promotion_id'];

                $finalManualDiscount = $item['frontend_discount'];
                $finalPromoDiscount = 0;
                $finalItemPromoId = null;

                if ($itemPromoDiscount > $finalManualDiscount) {
                    $finalPromoDiscount = $itemPromoDiscount;
                    $finalManualDiscount = 0;
                    $finalItemPromoId = $itemPromoId;
                    if ($itemPromoId) $usedPromoIds->push($itemPromoId);
                }

                $item['final_manual_discount'] = $finalManualDiscount;
                $item['final_promo_discount'] = $finalPromoDiscount;
                $item['final_promo_id'] = $finalItemPromoId;
                $item['final_subtotal'] = ($item['price'] * $item['qty']) - $finalManualDiscount - $finalPromoDiscount;

                $totalManualDiscount += $finalManualDiscount;
                $totalItemPromoDiscount += $finalPromoDiscount;
            }
            unset($item); // Fix: Unset reference to avoid side effects in subsequent loops

            // Subtotal after item discounts
            $subtotalAfterItems = $grossSubtotal - $totalManualDiscount - $totalItemPromoDiscount;

            // ─── Promo: Calculate global promo discount ────────────────────
            $globalPromoResult = $this->promotionService->calculateGlobalPromoDiscount($subtotalAfterItems, $outletId);
            $globalPromoDiscount = $globalPromoResult['discount'];
            $globalPromoId = $globalPromoResult['promotion_id'];
            $globalPromoName = $globalPromoResult['promo_name'];

            if ($globalPromoId) $usedPromoIds->push($globalPromoId);

            $tax = $data['tax'] ?? 0;
            $totalPromoDiscount = $totalItemPromoDiscount + $globalPromoDiscount;
            
            // Get tax setting to determine if price was already inclusive
            $taxPerItem = filter_var(\App\Models\Setting::get('tax_per_item', 'false'), FILTER_VALIDATE_BOOLEAN);
            
            if ($taxPerItem) {
                // If tax is per-item (Inclusive), subtotal already contains tax.
                $total = $grossSubtotal - $totalManualDiscount - $totalPromoDiscount;
            } else {
                // If tax is exclusive, total is subtotal - discounts + tax.
                $total = ($grossSubtotal + $tax) - $totalManualDiscount - $totalPromoDiscount;
            }
            
            $paid = $data['paid'];
            $change = $paid - $total;

            if ($change < 0) {
                throw new \Exception("Pembayaran kurang. Total: " . number_format($total) . ", Dibayar: " . number_format($paid));
            }

            // 3. Create the sale record
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => Auth::id(),
                'outlet_id' => $outletId,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $grossSubtotal,
                'tax' => $tax,
                'discount' => $totalManualDiscount,
                'promo_discount' => $totalPromoDiscount,
                'promo_name' => $globalPromoName,
                'promotion_id' => $globalPromoId,
                'total' => $total,
                'paid' => $paid,
                'change' => $change,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ]);

            // 4. Create sale items and update stock
            foreach ($items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant'] ? $item['variant']->id : null,
                    'product_name' => $item['product_name'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'discount' => $item['final_manual_discount'],
                    'promo_discount' => $item['final_promo_discount'],
                    'promotion_id' => $item['final_promo_id'],
                    'subtotal' => $item['final_subtotal'],
                ]);

                // Track item promo usage
                if ($item['final_promo_id']) {
                    // Record qty usage for Tipe E
                    $this->promotionService->recordItemQtyUsage(
                        $item['final_promo_id'],
                        $item['product']->id,
                        $item['variant'] ? $item['variant']->id : null,
                        $item['qty']
                    );
                }
                // Decrease stock in outlet settings
                \App\Models\OutletProductSetting::where('outlet_id', $outletId)
                    ->where('product_id', $item['product']->id)
                    ->where('product_variant_id', $item['variant'] ? $item['variant']->id : null)
                    ->decrement('stock', $item['qty']);

                // Record stock movement
                StockMovement::create([
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant'] ? $item['variant']->id : null,
                    'outlet_id' => $outletId,
                    'type' => 'out',
                    'quantity' => -$item['qty'],
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'notes' => "Penjualan #{$invoiceNumber}",
                    'user_id' => Auth::id(),
                ]);

                // PHASE 2 OPTIMIZATION: Invalidate product cache for this outlet
                $this->productService->invalidateProductCache($item['product']->id, $outletId);
            }
            unset($item);

            // ─── Promo: Record usage count for all used promos ─────────
            foreach ($usedPromoIds->unique() as $promoId) {
                $this->promotionService->recordUsage($promoId);
            }

            return $sale->load('items.product', 'items.productVariant', 'user', 'customer');
        });
    }

    /**
     * Generate invoice number: INV-YYYYMMDD-XXXX
     */
    public function generateInvoiceNumber(): string
    {
        $today = now()->format('Ymd');
        $prefix = "INV-{$today}-";

        $lastSale = Sale::where('invoice_number', 'like', "{$prefix}%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastSale) {
            $lastNumber = (int) substr($lastSale->invoice_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Void a sale and restore stock.
     */
    public function voidSale(Sale $sale): Sale
    {
        return DB::transaction(function () use ($sale) {
            if ($sale->status !== 'completed') {
                throw new \Exception("Hanya transaksi dengan status 'completed' yang bisa di-void.");
            }

            // Restore stock to the outlet
            $reversedPromoIds = collect();

            if ($sale->promotion_id) {
                $reversedPromoIds->push($sale->promotion_id);
            }

            foreach ($sale->items as $item) {
                // Reverse item promo usage
                if ($item->promotion_id) {
                    $reversedPromoIds->push($item->promotion_id);
                    $this->promotionService->reverseItemQtyUsage(
                        $item->promotion_id,
                        $item->product_id,
                        $item->product_variant_id,
                        $item->qty
                    );
                }

                \App\Models\OutletProductSetting::where('outlet_id', $sale->outlet_id)
                    ->where('product_id', $item->product_id)
                    ->where('product_variant_id', $item->product_variant_id)
                    ->increment('stock', $item->qty);

                StockMovement::create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'outlet_id' => $sale->outlet_id,
                    'type' => 'in',
                    'quantity' => $item->qty,
                    'reference_type' => 'void',
                    'reference_id' => $sale->id,
                    'notes' => "Void transaksi #{$sale->invoice_number}",
                    'user_id' => Auth::id(),
                ]);

                // PHASE 2 OPTIMIZATION: Invalidate product cache for this outlet
                $this->productService->invalidateProductCache($item->product_id, $sale->outlet_id);
            }

            // Reverse usage counts for unique promos
            foreach ($reversedPromoIds->unique() as $promoId) {
                $this->promotionService->reverseUsage($promoId);
            }

            $sale->update(['status' => 'voided']);

            return $sale->fresh(['items.product', 'user', 'customer']);
        });
    }
}
