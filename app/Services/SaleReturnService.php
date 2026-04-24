<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\StockMovement;
use App\Models\Shift;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleReturnService
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Process a sale return transaction.
     */
    public function processReturn(array $data): SaleReturn
    {
        return DB::transaction(function () use ($data) {
            $sale = Sale::findOrFail($data['sale_id']);
            $returnNumber = $this->generateReturnNumber();

            // 1. Create Return Record
            $saleReturn = SaleReturn::create([
                'return_number' => $returnNumber,
                'sale_id' => $sale->id,
                'user_id' => Auth::id(),
                'total_refund' => $data['total_refund'],
                'notes' => $data['notes'] ?? null,
            ]);

            // 2. Process Items
            foreach ($data['items'] as $item) {
                $returnItem = SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'qty' => $item['qty'],
                    'refund_price' => $item['refund_price'],
                    'is_damaged' => $item['is_damaged'] ?? false,
                ]);

                // 3. Stock Restoration (if not damaged)
                if (!$returnItem->is_damaged) {
                    if ($returnItem->product_variant_id) {
                        ProductVariant::where('id', $returnItem->product_variant_id)->increment('stock', $returnItem->qty);
                    } else {
                        Product::where('id', $returnItem->product_id)->increment('stock', $returnItem->qty);
                    }

                    // Record Stock Movement
                    StockMovement::create([
                        'product_id' => $returnItem->product_id,
                        'product_variant_id' => $returnItem->product_variant_id,
                        'type' => 'in',
                        'quantity' => $returnItem->qty,
                        'reference_type' => 'return',
                        'reference_id' => $saleReturn->id,
                        'notes' => "Item dikembalikan dari Nota #{$sale->invoice_number}",
                        'user_id' => Auth::id(),
                    ]);
                } else {
                    // Record Stock Movement for Damaged (but maybe type is 'out' or just a log)
                    // We'll record it as a log in stock_movements with 0 quantity if it stays out of pool
                    // but for common POS, damaged just doesn't increase 'stock'.
                }

                // PHASE 2 OPTIMIZATION: Invalidate product cache for this outlet
                $this->productService->invalidateProductCache($returnItem->product_id, $sale->outlet_id);
            }

            // 4. Shift Balance Deduction (Same-Day Refund Logic)
            $isSameDay = $sale->created_at->isToday();
            if ($isSameDay) {
                $activeShift = Shift::where('user_id', Auth::id())
                                    ->where('status', 'open')
                                    ->first();
                
                if ($activeShift) {
                    // Note: We don't have a specific column for 'refunds' in shifts yet, 
                    // but we can deduct from expected ending cash or similar if we have one.
                    // If we only have 'starting_cash', we'll likely need to track this deduction.
                    // For now, let's assume we want to track it so it reflects in 'actual_ending_cash'.
                    // I will add a column if needed or just handle it in the closing summary.
                }
            }

            // Update sale status if needed? Partial return might keep it 'completed' but we record returns.
            // If all items returned, maybe set to 'returned'? 
            // For now, let's keep status and just link returns.

            return $saleReturn->load('items.product', 'items.productVariant');
        });
    }

    /**
     * Generate return number: RET-YYYYMMDD-XXXX
     */
    private function generateReturnNumber(): string
    {
        $today = now()->format('Ymd');
        $prefix = "RET-{$today}-";

        $lastReturn = SaleReturn::where('return_number', 'like', "{$prefix}%")
            ->orderBy('return_number', 'desc')
            ->first();

        if ($lastReturn) {
            $lastNumber = (int) substr($lastReturn->return_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
