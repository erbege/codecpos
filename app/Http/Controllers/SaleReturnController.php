<?php

namespace App\Http\Controllers;

use App\Models\SaleReturn;
use App\Models\Sale;
use App\Services\SaleReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleReturnController extends Controller
{
    public function __construct(
        protected SaleReturnService $saleReturnService
    ) {}

    /**
     * Display a listing of sales returns.
     */
    public function index(Request $request): Response
    {
        $this->authorize('sales.read');

        $returns = SaleReturn::with(['sale', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('return_number', 'like', "%{$search}%")
                      ->orWhereHas('sale', function($q) use ($search) {
                          $q->where('invoice_number', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Returns/Index', [
            'returns' => $returns,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show return form for a specific sale.
     */
    public function create(Sale $sale): Response
    {
        $this->authorize('sales.create');

        // Load items with current returns to know remaining qty
        $sale->load(['items.product', 'items.productVariant', 'returns.items']);

        return Inertia::render('Returns/Create', [
            'sale' => $sale,
        ]);
    }

    /**
     * Store a newly created return.
     */
    public function store(Request $request)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'total_refund' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.refund_price' => 'required|numeric|min:0',
            'items.*.is_damaged' => 'required|boolean',
        ]);

        try {
            $saleReturn = $this->saleReturnService->processReturn($validated);

            return redirect()->route('sales.show', $validated['sale_id'])
                ->with('success', "Retur barang berhasil diproses! Ref: {$saleReturn->return_number}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified return.
     */
    public function show(SaleReturn $saleReturn): Response
    {
        $this->authorize('sales.read');

        return Inertia::render('Returns/Show', [
            'saleReturn' => $saleReturn->load('items.product', 'items.productVariant', 'sale', 'user'),
        ]);
    }
}
