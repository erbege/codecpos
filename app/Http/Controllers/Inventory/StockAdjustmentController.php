<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\OutletProductSetting;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('products.read');

        $outletId = Auth::user()->outlet_id;

        $products = Product::with(['category', 'variants'])
            ->where('is_active', true)
            ->get()
            ->map(function ($product) use ($outletId) {
                // Get stock for current outlet
                $setting = OutletProductSetting::where('outlet_id', $outletId)
                    ->where('product_id', $product->id)
                    ->whereNull('product_variant_id')
                    ->first();
                
                $product->current_stock = $setting ? $setting->stock : 0;

                if ($product->has_variants) {
                    $product->variants->map(function ($variant) use ($outletId, $product) {
                        $vSetting = OutletProductSetting::where('outlet_id', $outletId)
                            ->where('product_id', $product->id)
                            ->where('product_variant_id', $variant->id)
                            ->first();
                        $variant->current_stock = $vSetting ? $vSetting->stock : 0;
                        return $variant;
                    });
                }

                return $product;
            });

        return Inertia::render('Inventory/StockAdjustment', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('products.update');

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'new_stock' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',
        ]);

        $outletId = Auth::user()->outlet_id;
        $productId = $request->product_id;
        $variantId = $request->product_variant_id;
        $newStock = $request->new_stock;

        DB::transaction(function () use ($outletId, $productId, $variantId, $newStock, $request) {
            $setting = OutletProductSetting::where('outlet_id', $outletId)
                ->where('product_id', $productId)
                ->where('product_variant_id', $variantId)
                ->first();

            $currentStock = $setting ? $setting->stock : 0;
            $diff = $newStock - $currentStock;

            if ($setting) {
                $setting->update(['stock' => $newStock]);
            } else {
                OutletProductSetting::create([
                    'outlet_id' => $outletId,
                    'product_id' => $productId,
                    'product_variant_id' => $variantId,
                    'stock' => $newStock,
                ]);
            }

            // Record Movement
            StockMovement::create([
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'outlet_id' => $outletId,
                'type' => 'adjustment',
                'quantity' => $diff,
                'notes' => $request->reason,
                'user_id' => Auth::id(),
                'reference_type' => 'StockAdjustment',
                'reference_id' => Auth::id(), 
            ]);
        });

        return redirect()->back()->with('success', 'Stok berhasil disesuaikan.');
    }
}
