<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\PurchaseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseService $purchaseService
    ) {}

    /**
     * Display a listing of the purchases.
     */
    public function index(Request $request): Response
    {
        $this->authorize('stock.read');

        $purchases = Purchase::with(['supplier', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('reference_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new purchase.
     */
    public function create(): Response
    {
        $this->authorize('stock.adjust');

        $suppliers = Supplier::orderBy('name')->get();
        $products = Product::where('is_active', true)->with('variants')->orderBy('name')->get();

        return Inertia::render('Purchases/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created purchase in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('stock.adjust');

        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        try {
            $purchase = $this->purchaseService->createPurchase($validated);

            return redirect()->route('purchases.index')->with('success', "Pembelian berhasil disimpan! Ref: {$purchase->reference_number}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Display the specified purchase.
     */
    public function show(Purchase $purchase): Response
    {
        $this->authorize('stock.read');

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase->load('items.product', 'user', 'supplier'),
        ]);
    }
}
