<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Jobs\OptimizeProductImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function getProducts(array $filters = []): LengthAwarePaginator
    {
        $outletId = \Illuminate\Support\Facades\Auth::user()->outlet_id;

        return Product::with(['category', 'variants.outletSettings' => function($q) use ($outletId) {
                $q->where('outlet_id', $outletId);
            }, 'outletSettings' => function($q) use ($outletId) {
                $q->where('outlet_id', $outletId);
            }])
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%")
                      ->orWhereHas('variants', function (Builder $vq) use ($search) {
                          $vq->where('sku', 'like', "%{$search}%")
                             ->orWhere('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($filters['category_id'] ?? null, function (Builder $query, int $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when(isset($filters['is_active']), function (Builder $query) use ($filters) {
                $query->where('is_active', $filters['is_active']);
            })
            ->when($filters['low_stock'] ?? false, function (Builder $query) use ($outletId) {
                $query->whereHas('outletSettings', function ($q) use ($outletId) {
                    $q->where('outlet_id', $outletId)->whereColumn('stock', '<=', 'min_stock');
                });
            })
            ->orderBy($filters['sort'] ?? 'name', $filters['direction'] ?? 'asc')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString()
            ->through(function ($product) use ($outletId) {
                $setting = $product->outletSettings->first();
                if ($setting) {
                    $product->stock = $setting->stock;
                    $product->price = $setting->price ?? $product->price;
                    $product->min_stock = $setting->min_stock;
                }
                
                $product->variants->map(function ($variant) use ($outletId) {
                    $vSetting = $variant->outletSettings->first();
                    if ($vSetting) {
                        $variant->stock = $vSetting->stock;
                        $variant->price = $vSetting->price ?? $variant->price;
                    }
                    return $variant;
                });
                return $product;
            });
    }

    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                $data['image'] = $data['image']->store('products', 'public');
                OptimizeProductImage::dispatch($data['image']);
            }

            $product = Product::create($data);

            // Register product to ALL outlets
            $outlets = \App\Models\Outlet::all();
            $currentOutletId = \Illuminate\Support\Facades\Auth::user()->outlet_id;

            foreach ($outlets as $outlet) {
                $stock = ($outlet->id == $currentOutletId) ? ($data['stock'] ?? 0) : 0;
                
                \App\Models\OutletProductSetting::create([
                    'outlet_id' => $outlet->id,
                    'product_id' => $product->id,
                    'product_variant_id' => null,
                    'stock' => $stock,
                    'min_stock' => $data['min_stock'] ?? 0,
                    'price' => $data['price'] ?? null,
                ]);

                if ($stock > 0) {
                    \App\Models\StockMovement::create([
                        'product_id' => $product->id,
                        'product_variant_id' => null,
                        'outlet_id' => $outlet->id,
                        'type' => 'in',
                        'quantity' => $stock,
                        'reference_type' => 'initial',
                        'notes' => 'Stok awal produk',
                        'user_id' => \Illuminate\Support\Facades\Auth::id(),
                    ]);
                }
            }

            if (($data['has_variants'] ?? false) && !empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variantImage = null;
                    if (isset($variantData['image']) && $variantData['image'] instanceof UploadedFile) {
                        $variantImage = $variantData['image']->store('variants', 'public');
                        OptimizeProductImage::dispatch($variantImage);
                    }

                    $variant = $product->variants()->create([
                        'name' => $variantData['name'],
                        'sku' => $variantData['sku'],
                        'stock' => 0, // Master stock no longer used
                        'price' => $variantData['price'] ?? null,
                        'image' => $variantImage,
                    ]);

                    // Register variant to ALL outlets
                    foreach ($outlets as $outlet) {
                        \App\Models\OutletProductSetting::create([
                            'outlet_id' => $outlet->id,
                            'product_id' => $product->id,
                            'product_variant_id' => $variant->id,
                            'stock' => ($outlet->id == $currentOutletId) ? ($variantData['stock'] ?? 0) : 0,
                            'price' => $variantData['price'] ?? null,
                        ]);
                    }
                }
            }

            return $product;
        });
    }

    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $currentOutletId = \Illuminate\Support\Facades\Auth::user()->outlet_id;

            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $data['image'] = $data['image']->store('products', 'public');
                OptimizeProductImage::dispatch($data['image']);
            }

            // Update Global Product Info
            $product->update([
                'category_id' => $data['category_id'],
                'name' => $data['name'],
                'sku' => $data['sku'],
                'barcode' => $data['barcode'],
                'image' => $data['image'] ?? $product->image,
                'is_active' => $data['is_active'],
                'has_variants' => $data['has_variants'],
            ]);

            // Update Current Outlet Settings for Product
            $setting = \App\Models\OutletProductSetting::where([
                'outlet_id' => $currentOutletId, 
                'product_id' => $product->id, 
                'product_variant_id' => null
            ])->first();

            $newStock = $data['stock'] ?? 0;
            if ($setting && $setting->stock != $newStock) {
                \App\Models\StockMovement::create([
                    'product_id' => $product->id,
                    'product_variant_id' => null,
                    'outlet_id' => $currentOutletId,
                    'type' => 'adjustment',
                    'quantity' => $newStock - $setting->stock,
                    'reference_type' => 'update',
                    'notes' => 'Pembaruan stok via edit produk',
                    'user_id' => \Illuminate\Support\Facades\Auth::id(),
                ]);
            }

            \App\Models\OutletProductSetting::updateOrCreate(
                ['outlet_id' => $currentOutletId, 'product_id' => $product->id, 'product_variant_id' => null],
                [
                    'stock' => $newStock,
                    'min_stock' => $data['min_stock'] ?? 0,
                    'price' => $data['price'] ?? null,
                ]
            );

            if ($data['has_variants'] ?? false) {
                $keptVariantIds = collect($data['variants'] ?? [])
                    ->filter(fn($v) => !empty($v['id']))
                    ->pluck('id')
                    ->toArray();
                
                // Delete removed variants
                $product->variants()->whereNotIn('id', $keptVariantIds)->delete();
                \App\Models\OutletProductSetting::where('product_id', $product->id)
                    ->whereNotNull('product_variant_id')
                    ->whereNotIn('product_variant_id', $keptVariantIds)
                    ->delete();

                if (!empty($data['variants'])) {
                    $outlets = \App\Models\Outlet::all();
                    foreach ($data['variants'] as $variantData) {
                        if (!empty($variantData['id'])) {
                            // Update existing
                            $variant = ProductVariant::findOrFail($variantData['id']);
                            
                            $variant->update([
                                'name' => $variantData['name'],
                                'sku' => $variantData['sku'],
                                'price' => $variantData['price'] ?? $variant->price, // Update base price
                            ]);

                            // Update current outlet setting for variant
                            \App\Models\OutletProductSetting::updateOrCreate(
                                ['outlet_id' => $currentOutletId, 'product_id' => $product->id, 'product_variant_id' => $variant->id],
                                [
                                    'stock' => $variantData['stock'] ?? 0,
                                    'price' => $variantData['price'] ?? null,
                                ]
                            );
                        } else {
                            // Create new
                            $variant = $product->variants()->create([
                                'name' => $variantData['name'],
                                'sku' => $variantData['sku'],
                                'stock' => 0,
                                'price' => $variantData['price'] ?? null,
                            ]);

                            // Register to all outlets
                            foreach ($outlets as $outlet) {
                                \App\Models\OutletProductSetting::create([
                                    'outlet_id' => $outlet->id,
                                    'product_id' => $product->id,
                                    'product_variant_id' => $variant->id,
                                    'stock' => ($outlet->id == $currentOutletId) ? ($variantData['stock'] ?? 0) : 0,
                                    'price' => $variantData['price'] ?? null,
                                ]);
                            }
                        }
                    }
                }
            } else {
                $product->variants()->delete();
                \App\Models\OutletProductSetting::where('product_id', $product->id)->whereNotNull('product_variant_id')->delete();
            }

            return $product->fresh('variants');
        });
    }

    public function deleteProduct(Product $product): bool
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        foreach ($product->variants as $v) {
            if ($v->image) {
                Storage::disk('public')->delete($v->image);
            }
        }

        return $product->delete();
    }

    public function getActiveProducts(string $search = ''): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['category', 'variants'])
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('stock', '>', 0)
                      ->orWhereHas('variants', function ($vq) {
                          $vq->where('stock', '>', 0);
                      });
            })
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('barcode', $search);
                });
            })
            ->orderBy('name')
            ->get();
    }
}
