<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleService
{
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
            $subtotal = 0;
            $items = [];

            $outletId = $data['outlet_id'];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = null;

                if (!empty($item['product_variant_id'])) {
                    $variant = \App\Models\ProductVariant::findOrFail($item['product_variant_id']);
                }

                // Get outlet-specific setting
                $setting = \App\Models\OutletProductSetting::where('outlet_id', $outletId)
                    ->where('product_id', $item['product_id'])
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

                $itemDiscount = $item['discount'] ?? 0;
                $itemSubtotal = ($itemPrice * $item['qty']) - $itemDiscount;

                $items[] = [
                    'product' => $product,
                    'variant' => $variant,
                    'product_name' => $itemName,
                    'qty' => $item['qty'],
                    'price' => $itemPrice,
                    'discount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                ];

                $subtotal += $itemSubtotal;
            }

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;
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
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
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
                    'discount' => $item['discount'],
                    'subtotal' => $item['subtotal'],
                ]);

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
            foreach ($sale->items as $item) {
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
            }

            $sale->update(['status' => 'voided']);

            return $sale->fresh(['items.product', 'user', 'customer']);
        });
    }
}
