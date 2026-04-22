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
     * Get the active outlet ID for the current session/user.
     */
    private function getActiveOutletId(): ?int
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');
        
        // For Admins/Owners, prioritize session if set.
        if ($isAdmin) {
            return session('active_pos_outlet_id') ?: $user->outlet_id;
        }

        return (int) $user->outlet_id;
    }

    /**
     * POS page
     */
    public function create()
    {
        $this->authorize('sales.create');

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');
        $outletId = $this->getActiveOutletId();

        // If Admin hasn't selected an outlet, they must select one
        if ($isAdmin && !$outletId) {
            $outlets = \App\Models\Outlet::where('is_active', true)->orderBy('name')->get();
            return Inertia::render('POS/SelectOutlet', [
                'outlets' => $outlets
            ]);
        }

        $enableShiftManagement = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);

        // Check if there is an active shift for the user at this specific outlet
        $activeShift = Shift::where('user_id', Auth::id())
                            ->where('outlet_id', $outletId)
                            ->where('status', 'open')
                            ->first();

        if ($enableShiftManagement && !$activeShift) {
            return redirect()->route('shifts.index')
                ->with('error', 'Anda harus membuka kasir (shift) terlebih dahulu sebelum melakukan transaksi.');
        }

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
            'currentOutletId' => $outletId,
            'outlets' => $isAdmin ? \App\Models\Outlet::where('is_active', true)->orderBy('name')->get() : [],
            'canSwitchOutlet' => $isAdmin,
            'users' => \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get(),
        ]);
    }

    /**
     * Switch active outlet (Admins only)
     */
    public function setOutlet(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'outlet_id' => 'required|exists:outlets,id'
        ]);

        $user = Auth::user();
        if (!$user->hasRole('admin') && !$user->hasRole('super-admin') && !$user->hasRole('owner')) {
            return back()->with('error', 'Anda tidak memiliki akses untuk mengubah outlet.');
        }

        session(['active_pos_outlet_id' => (int) $request->outlet_id]);

        return redirect()->route('pos')->with('success', 'Berhasil berpindah ke outlet yang dipilih.');
    }

    /**
     * Process checkout
     */
    public function store(StoreSaleRequest $request)
    {
        $outletId = $this->getActiveOutletId();

        $enableShiftManagement = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);

        $activeShift = \App\Models\Shift::where('user_id', \Illuminate\Support\Facades\Auth::id())
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        if ($enableShiftManagement && !$activeShift) {
            return back()->withErrors(['checkout' => 'Anda harus membuka shift terlebih dahulu untuk outlet ini.']);
        }

        try {
            $data = $request->validated();
            $data['outlet_id'] = $outletId;
            
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
