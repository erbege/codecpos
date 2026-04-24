<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Create a new purchase transaction.
     * All operations wrapped in a DB transaction for atomicity.
     */
    public function createPurchase(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            // 1. Generate Reference Number
            $referenceNumber = $this->generateReferenceNumber();

            // 2. Calculate totals
            $totalAmount = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                // We use lockForUpdate to ensure stock updates are consistent
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $variant = null;
                
                if (!empty($item['product_variant_id'])) {
                    $variant = \App\Models\ProductVariant::lockForUpdate()->findOrFail($item['product_variant_id']);
                }

                $itemSubtotal = $item['unit_cost'] * $item['qty'];

                $items[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant ? $variant->id : null,
                    'qty' => $item['qty'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $itemSubtotal,
                ];

                $totalAmount += $itemSubtotal;
            }

            // 3. Create the purchase record
            $purchase = Purchase::create([
                'reference_number' => $referenceNumber,
                'outlet_id' => Auth::user()->outlet_id,
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => Auth::id(),
                'purchase_date' => $data['purchase_date'] ?? now(),
                'total_amount' => $totalAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            // 4. Create purchase items and update stock
            $outletId = Auth::user()->outlet_id;

            foreach ($items as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'],
                    'qty' => $item['qty'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Increase stock in outlet settings (Source of truth)
                \App\Models\OutletProductSetting::updateOrCreate(
                    [
                        'outlet_id' => $outletId,
                        'product_id' => $item['product_id'],
                        'product_variant_id' => $item['variant_id']
                    ],
                    [
                        'stock' => DB::raw("stock + {$item['qty']}")
                    ]
                );

                // Record stock movement
                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'],
                    'outlet_id' => $outletId,
                    'type' => 'in',
                    'quantity' => $item['qty'],
                    'reference_type' => 'purchase',
                    'reference_id' => $purchase->id,
                    'notes' => "Pembelian/Barang Masuk #{$referenceNumber}",
                    'user_id' => Auth::id(),
                ]);

                // PHASE 2 OPTIMIZATION: Invalidate product cache for this outlet
                $this->productService->invalidateProductCache($item['product_id'], $outletId);
            }

            return $purchase->load('items.product', 'user', 'supplier');
        });
    }

    /**
     * Generate Ref number: PUR-YYYYMMDD-XXXX
     */
    public function generateReferenceNumber(): string
    {
        $today = now()->format('Ymd');
        $prefix = "PUR-{$today}-";

        $lastPurchase = Purchase::where('reference_number', 'like', "{$prefix}%")
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastPurchase) {
            $lastNumber = (int) substr($lastPurchase->reference_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
