<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePromotionRequest;
use App\Models\Promotion;
use App\Models\PromotionItem;
use App\Models\Product;
use App\Models\Outlet;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * List all promotions with filters.
     */
    public function index(): Response
    {
        $this->authorize('promotions.read');

        $promotions = Promotion::with(['items.product', 'items.productVariant', 'outlets', 'createdBy'])
            ->when(request('status'), function ($query, $status) {
                $now = now();
                match ($status) {
                    'active' => $query->where('is_active', true)
                        ->where('start_date', '<=', $now)
                        ->where('end_date', '>=', $now),
                    'upcoming' => $query->where('is_active', true)
                        ->where('start_date', '>', $now),
                    'expired' => $query->where('end_date', '<', $now),
                    'inactive' => $query->where('is_active', false),
                    default => null,
                };
            })
            ->when(request('scope'), function ($query, $scope) {
                $query->where('scope', $scope);
            })
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Promotions/Index', [
            'promotions' => $promotions,
            'filters' => request()->only(['status', 'scope', 'search']),
        ]);
    }

    /**
     * Show create form.
     */
    public function create(): Response
    {
        $this->authorize('promotions.create');

        $products = Product::with('variants')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $outlets = Outlet::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Promotions/Create', [
            'products' => $products,
            'outlets' => $outlets,
        ]);
    }

    /**
     * Store a new promotion.
     */
    public function store(StorePromotionRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $promotion = Promotion::create([
                'name' => $data['name'],
                'code' => $data['code'] ?? null,
                'description' => $data['description'] ?? null,
                'scope' => $data['scope'],
                'discount_type' => $data['discount_type'],
                'discount_value' => $data['discount_value'],
                'max_discount' => $data['max_discount'] ?? null,
                'min_purchase' => $data['min_purchase'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'max_usage' => $data['max_usage'] ?? null,
                'priority' => $data['priority'] ?? 0,
                'is_active' => true,
                'created_by' => Auth::id(),
            ]);

            // Attach product items (for product scope)
            if ($data['scope'] === 'product' && !empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    PromotionItem::create([
                        'promotion_id' => $promotion->id,
                        'product_id' => $item['product_id'],
                        'product_variant_id' => $item['product_variant_id'] ?? null,
                        'max_qty' => $item['max_qty'] ?? null,
                    ]);
                }
            }

            // Attach outlets (if not all outlets)
            if (!($data['apply_all_outlets'] ?? true) && !empty($data['outlet_ids'])) {
                $promotion->outlets()->sync($data['outlet_ids']);
            }
        });

        return redirect()->route('promotions.index')
            ->with('success', 'Promo berhasil dibuat.');
    }

    /**
     * Show edit form.
     */
    public function edit(Promotion $promotion): Response
    {
        $this->authorize('promotions.update');

        $promotion->load(['items.product', 'items.productVariant', 'outlets']);

        $products = Product::with('variants')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $outlets = Outlet::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Promotions/Edit', [
            'promotion' => $promotion,
            'products' => $products,
            'outlets' => $outlets,
        ]);
    }

    /**
     * Update an existing promotion.
     */
    public function update(StorePromotionRequest $request, Promotion $promotion)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $promotion) {
            $promotion->update([
                'name' => $data['name'],
                'code' => $data['code'] ?? null,
                'description' => $data['description'] ?? null,
                'scope' => $data['scope'],
                'discount_type' => $data['discount_type'],
                'discount_value' => $data['discount_value'],
                'max_discount' => $data['max_discount'] ?? null,
                'min_purchase' => $data['min_purchase'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'max_usage' => $data['max_usage'] ?? null,
                'priority' => $data['priority'] ?? 0,
            ]);

            // Re-sync product items
            if ($data['scope'] === 'product') {
                // Remove existing items and re-create (preserve qty_used for matching items)
                $existingItems = $promotion->items->keyBy(function ($item) {
                    return $item->product_id . '_' . ($item->product_variant_id ?? 'null');
                });

                $promotion->items()->delete();

                if (!empty($data['items'])) {
                    foreach ($data['items'] as $item) {
                        $key = $item['product_id'] . '_' . ($item['product_variant_id'] ?? 'null');
                        $existingItem = $existingItems->get($key);

                        PromotionItem::create([
                            'promotion_id' => $promotion->id,
                            'product_id' => $item['product_id'],
                            'product_variant_id' => $item['product_variant_id'] ?? null,
                            'max_qty' => $item['max_qty'] ?? null,
                            'qty_used' => $existingItem ? $existingItem->qty_used : 0,
                        ]);
                    }
                }
            } else {
                $promotion->items()->delete();
            }

            // Re-sync outlets
            if (!($data['apply_all_outlets'] ?? true) && !empty($data['outlet_ids'])) {
                $promotion->outlets()->sync($data['outlet_ids']);
            } else {
                $promotion->outlets()->detach();
            }
        });

        return redirect()->route('promotions.index')
            ->with('success', 'Promo berhasil diperbarui.');
    }

    /**
     * Toggle promotion active status.
     */
    public function toggle(Promotion $promotion)
    {
        $this->authorize('promotions.update');

        $promotion->update(['is_active' => !$promotion->is_active]);

        $status = $promotion->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Promo berhasil {$status}.");
    }

    /**
     * Delete a promotion.
     */
    public function destroy(Promotion $promotion)
    {
        $this->authorize('promotions.delete');

        // Check if promo has been used
        if ($promotion->usage_count > 0) {
            // Soft-deactivate instead of hard delete for audit trail
            $promotion->update(['is_active' => false]);
            return back()->with('success', 'Promo telah dinonaktifkan (tidak dihapus karena sudah pernah digunakan).');
        }

        $promotion->delete();
        return back()->with('success', 'Promo berhasil dihapus.');
    }
}
