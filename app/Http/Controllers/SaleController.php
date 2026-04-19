<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\ProductService;
use App\Services\SaleService;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Shift;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function __construct(
        protected SaleService $saleService,
        protected ProductService $productService,
    ) {}

    /**
     * POS page
     */
    public function create()
    {
        $this->authorize('sales.create');

        // Check if there is an active shift for the user
        $activeShift = Shift::where('user_id', Auth::id())
                            ->where('status', 'open')
                            ->first();

        if (!$activeShift) {
            return redirect()->route('shifts.index')
                ->with('error', 'Anda harus membuka kasir (shift) terlebih dahulu sebelum melakukan transaksi.');
        }

        $outletId = Auth::user()->outlet_id;

        $products = Product::whereHas('outletSettings', function($q) use ($outletId) {
            $q->where('outlet_id', $outletId)->where('is_active', true);
        })
        ->with(['category', 'variants.outletSettings' => function($q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        }, 'outletSettings' => function($q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        }])
        ->get()
        ->map(function($product) use ($outletId) {
            $setting = $product->outletSettings->first();
            if ($setting) {
                $product->price = $setting->price ?? $product->price;
                $product->stock = $setting->stock;
            }

            // Map variants too
            $product->variants->map(function($variant) use ($outletId) {
                $vSetting = $variant->outletSettings->first();
                if ($vSetting) {
                    $variant->price = $vSetting->price ?? $variant->price;
                    $variant->stock = $vSetting->stock;
                }
                return $variant;
            });

            return $product;
        });

        $categories = Category::all();
        $customers = Customer::all();

        $taxEnabled = filter_var(\App\Models\Setting::get('tax_enabled', 'false'), FILTER_VALIDATE_BOOLEAN);
        $taxPercentage = (float)\App\Models\Setting::get('tax_percentage', 11);
        $taxPerItem = filter_var(\App\Models\Setting::get('tax_per_item', 'false'), FILTER_VALIDATE_BOOLEAN);

        return Inertia::render('POS/Index', [
            'products' => $products,
            'categories' => $categories,
            'customers' => $customers,
            'taxRate' => $taxEnabled ? $taxPercentage : 0,
            'taxPerItem' => $taxPerItem,
        ]);
    }

    /**
     * Process checkout
     */
    public function store(StoreSaleRequest $request)
    {
        $activeShift = \App\Models\Shift::where('user_id', \Illuminate\Support\Facades\Auth::id())
            ->where('status', 'open')
            ->first();

        if (!$activeShift) {
            return back()->withErrors(['checkout' => 'Anda harus membuka shift terlebih dahulu.']);
        }

        try {
            $data = $request->validated();
            $data['outlet_id'] = \Illuminate\Support\Facades\Auth::user()->outlet_id;
            
            $sale = $this->saleService->createSale($data);

            return redirect()->route('pos')->with([
                'success' => "Transaksi berhasil!",
                'last_sale_invoice' => $sale->invoice_number
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['checkout' => $e->getMessage()]);
        }
    }

    /**
     * Sales history
     */
    public function index(): Response
    {
        $this->authorize('sales.read');

        $isAdmin = Auth::user()->hasRole('admin') || Auth::user()->hasRole('super-admin');
        
        $sales = Sale::with('user', 'customer', 'outlet')
            ->when(!$isAdmin, function ($query) {
                $query->where('outlet_id', Auth::user()->outlet_id);
            })
            ->when($isAdmin && request('outlet_id'), function ($query, $outletId) {
                $query->where('outlet_id', $outletId);
            })
            ->when(request('search'), function ($query, $search) {
                $query->where('invoice_number', 'like', "%{$search}%");
            })
            ->when(request('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when(request('date_from'), function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when(request('date_to'), function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => request()->only(['search', 'status', 'date_from', 'date_to', 'outlet_id']),
            'outlets' => $isAdmin ? \App\Models\Outlet::all() : [],
        ]);
    }

    /**
     * Sale detail
     */
    public function show(Sale $sale): Response
    {
        $this->authorize('sales.read');

        return Inertia::render('Sales/Show', [
            'sale' => $sale->load('items.product', 'user', 'customer', 'outlet'),
        ]);
    }

    /**
     * Void a sale
     */
    public function void(Sale $sale)
    {
        $this->authorize('sales.void');

        try {
            $this->saleService->voidSale($sale);
            return back()->with('success', 'Transaksi berhasil di-void.');
        } catch (\Exception $e) {
            return back()->withErrors(['void' => $e->getMessage()]);
        }
    }
}
